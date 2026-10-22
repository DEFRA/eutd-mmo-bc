import hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { config } from '~/src/config/index.js'
import * as aadCacheHelper from '~/src/server/common/helpers/authentication/cache.js'
import { createServer } from '~/src/server/index.js'

const sessionAuth = 'session-auth'
const nowMs = 1_700_000_000_000
const nowSeconds = nowMs / 1000
const cookieName = config.get('azureAd').cookieName

describe('#createServer', () => {
  /** @type {Server} */
  let server
  let aadCache
  let sessionStrategyOptions
  let apiKeyScheme

  beforeEach(async () => {
    aadCache = { get: jest.fn() }
    jest.spyOn(aadCacheHelper, 'createAzureAdCache').mockResolvedValue(aadCache)

    // Spy on the real server's auth API so we can capture the options/scheme createServer registers
    let strategySpy
    let schemeSpy
    const realServerFactory = hapi.server
    jest.spyOn(hapi, 'server').mockImplementation((options) => {
      const instance = realServerFactory(options)
      strategySpy = jest.spyOn(instance.auth, 'strategy')
      schemeSpy = jest.spyOn(instance.auth, 'scheme')
      return instance
    })

    server = await createServer()
    await server.initialize()

    sessionStrategyOptions = strategySpy.mock.calls.find(
      ([name]) => name === sessionAuth
    )[2]
    apiKeyScheme = schemeSpy.mock.calls.find(([name]) => name === 'api-key')[1]
  })

  afterEach(async () => {
    await server.stop()
    jest.restoreAllMocks()
  })

  describe('server configuration', () => {
    test('Should set session-auth as the default auth strategy', () => {
      expect(server.auth.settings.default).toEqual(
        expect.objectContaining({ strategies: [sessionAuth] })
      )
    })

    test('Should store the AAD cache on server.app', () => {
      expect(aadCacheHelper.createAzureAdCache).toHaveBeenCalledWith(server)
      expect(server.app.aadCache).toBe(aadCache)
    })

    test('Should configure the session cookie strategy', () => {
      expect(sessionStrategyOptions).toEqual(
        expect.objectContaining({
          appendNext: true,
          redirectTo: `${config.get('baseUrl')}/login/out`,
          cookie: {
            name: cookieName,
            password: config.get('authCookiePassword'),
            isSecure: true,
            isSameSite: 'Lax',
            ttl: 24 * 60 * 60 * 1000,
            path: '/'
          }
        })
      )
    })

    test('Should register crumb with enforcement disabled in test', () => {
      expect(server.registrations['@hapi/crumb'].options).toEqual({
        enforce: false,
        cookieOptions: { isSecure: true }
      })
    })

    test('Should not register secure context outside production', () => {
      expect(server.registrations['secure-context']).toBeUndefined()
    })
  })

  describe('session-auth validate', () => {
    const requestWithSub = (sub) => ({ state: { [cookieName]: { sub } } })

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(nowMs)
    })

    test('Should be invalid when reading the session state throws', async () => {
      const request = {
        get state() {
          throw new Error('bad cookie')
        }
      }

      await expect(sessionStrategyOptions.validate(request)).resolves.toEqual({
        isValid: false
      })
      expect(aadCache.get).not.toHaveBeenCalled()
    })

    test('Should be invalid when there is no session cookie', async () => {
      await expect(
        sessionStrategyOptions.validate({ state: {} })
      ).resolves.toEqual({ isValid: false })
      expect(aadCache.get).not.toHaveBeenCalled()
    })

    test('Should be invalid when the session cookie has no sub', async () => {
      await expect(
        sessionStrategyOptions.validate(requestWithSub(undefined))
      ).resolves.toEqual({ isValid: false })
      expect(aadCache.get).not.toHaveBeenCalled()
    })

    test('Should be valid when cached token has not expired', async () => {
      aadCache.get.mockResolvedValue({ claims: { exp: nowSeconds + 60 } })

      await expect(
        sessionStrategyOptions.validate(requestWithSub('user-sub'))
      ).resolves.toEqual({ isValid: true })
      expect(aadCache.get).toHaveBeenCalledWith('user-sub')
    })

    test('Should be invalid when cached token has expired', async () => {
      aadCache.get.mockResolvedValue({ claims: { exp: nowSeconds - 60 } })

      await expect(
        sessionStrategyOptions.validate(requestWithSub('user-sub'))
      ).resolves.toEqual({ isValid: false })
    })

    test('Should be invalid when cached data has no claims', async () => {
      aadCache.get.mockResolvedValue({})

      const { isValid } = await sessionStrategyOptions.validate(
        requestWithSub('user-sub')
      )

      expect(isValid).toBeFalsy()
    })

    test.each([
      ['null', null],
      ['undefined', undefined],
      ['a string', 'not-an-object']
    ])(
      'Should be invalid when cached data is %s',
      async (_label, cacheData) => {
        aadCache.get.mockResolvedValue(cacheData)

        await expect(
          sessionStrategyOptions.validate(requestWithSub('user-sub'))
        ).resolves.toEqual({ isValid: false })
      }
    )
  })

  describe('api-key scheme', () => {
    const buildToolkit = () => ({
      authenticated: jest.fn((result) => result),
      unauthenticated: jest.fn((error) => error)
    })

    test.each([
      ['missing', {}],
      ['incorrect', { 'x-api-key': 'wrong-key' }]
    ])('Should reject a %s API key', (_label, headers) => {
      const h = buildToolkit()

      apiKeyScheme().authenticate({ headers }, h)

      expect(h.authenticated).not.toHaveBeenCalled()
      const [error] = h.unauthenticated.mock.calls[0]
      expect(Boom.isBoom(error)).toBe(true)
      expect(error.output.statusCode).toBe(401)
      expect(error.output.payload).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid API key'
      })
      expect(error.output.headers['content-type']).toBe('application/json')
    })

    test('Should authenticate a valid API key', () => {
      const h = buildToolkit()
      const apiKey = config.get('apiAuth')

      apiKeyScheme().authenticate({ headers: { 'x-api-key': apiKey } }, h)

      expect(h.unauthenticated).not.toHaveBeenCalled()
      expect(h.authenticated).toHaveBeenCalledWith({
        credentials: { apiKey }
      })
    })
  })
})

describe('#createServer in production', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Should register the secure context plugin', async () => {
    const secureContextRegister = jest.fn()
    let prodServer

    // isProduction is read when the module loads, so load fresh copies with it forced to true
    await jest.isolateModulesAsync(async () => {
      jest.doMock(
        '~/src/server/common/helpers/secure-context/index.js',
        () => ({
          secureContext: {
            plugin: { name: 'secure-context', register: secureContextRegister }
          }
        })
      )

      const { config: isolatedConfig } = await import('~/src/config/index.js')
      const realGet = isolatedConfig.get.bind(isolatedConfig)
      jest
        .spyOn(isolatedConfig, 'get')
        .mockImplementation((key) =>
          key === 'isProduction' ? true : realGet(key)
        )

      const { createServer: createProdServer } = await import(
        '~/src/server/index.js'
      )
      prodServer = await createProdServer()
    })

    expect(secureContextRegister).toHaveBeenCalledTimes(1)
    expect(prodServer.registrations['secure-context']).toBeDefined()

    await prodServer.stop()
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
