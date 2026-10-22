import { createServer } from '~/src/server/index.js'
import { config } from '~/src/config/index.js'
import AuthenticationClient from '~/src/server/common/helpers/authentication/AuthenticationClient.js'

const baseUrl = config.get('baseUrl')
const cookieName = config.get('azureAd').cookieName
const callbackPath = '/auth/openid/return'
const redirectUri = `${baseUrl}${callbackPath}`
const logoutUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(baseUrl)}/`

const buildToolkit = () => {
  const takeover = jest.fn(() => 'takeover-response')
  return {
    takeover,
    redirect: jest.fn((location) => ({ location, takeover }))
  }
}

describe('#login plugin', () => {
  /** @type {Server} */
  let server
  let client

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    client = {
      authorizationUrl: jest.fn(() => 'https://login.example/authorize'),
      callback: jest.fn()
    }
    jest.spyOn(AuthenticationClient, 'getClient').mockResolvedValue(client)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /login/out', () => {
    test('Should redirect to the Azure AD authorization URL', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/login/out'
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe('https://login.example/authorize')
      expect(client.authorizationUrl).toHaveBeenCalledWith({
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        response_mode: 'form_post'
      })
    })

    test('Should return 503 when the Azure AD client is unavailable', async () => {
      jest
        .spyOn(AuthenticationClient, 'getClient')
        .mockRejectedValue(new Error('discovery failed'))

      const { statusCode, payload } = await server.inject({
        method: 'GET',
        url: '/login/out'
      })

      expect(statusCode).toBe(503)
      expect(payload).toBe('Authentication service unavailable')
    })
  })

  describe(`${callbackPath} callback`, () => {
    const getCallbackHandler = () =>
      server.match('POST', callbackPath).settings.handler

    const buildTokenSet = (claims) => ({
      session_state: 'session-123',
      claims: () => claims
    })

    const buildRequest = () => ({
      payload: { code: 'auth-code', state: 'state-123' },
      info: { remoteAddress: '10.0.0.1' },
      cookieAuth: { set: jest.fn() }
    })

    test('Should cache the token set, set the auth cookie and redirect to admin', async () => {
      const claims = {
        sub: 'user-sub',
        name: 'Test User',
        ipaddr: '192.168.1.1',
        roles: ['Admin', 'Viewer']
      }
      const tokenSet = buildTokenSet(claims)
      client.callback.mockResolvedValue(tokenSet)
      const cacheSet = jest
        .spyOn(server.app.aadCache, 'set')
        .mockResolvedValue(undefined)
      const request = buildRequest()
      const h = buildToolkit()

      const response = await getCallbackHandler()(request, h)

      expect(client.callback).toHaveBeenCalledWith(
        redirectUri,
        request.payload,
        { state: 'state-123' }
      )
      expect(cacheSet).toHaveBeenCalledWith(
        'user-sub',
        { tokenSet, claims },
        undefined
      )
      expect(request.cookieAuth.set).toHaveBeenCalledWith({
        sub: 'user-sub',
        name: 'Test User',
        ipaddr: '192.168.1.1',
        session: 'session-123',
        role: 'Admin'
      })
      expect(h.redirect).toHaveBeenCalledWith(`${baseUrl}/admin`)
      expect(response).toEqual({
        location: `${baseUrl}/admin`,
        takeover: h.takeover
      })
      expect(h.takeover).not.toHaveBeenCalled()
    })

    test('Should fall back to the remote address and no role when claims omit them', async () => {
      client.callback.mockResolvedValue(
        buildTokenSet({ sub: 'user-sub', name: 'Test User' })
      )
      jest.spyOn(server.app.aadCache, 'set').mockResolvedValue(undefined)
      const request = buildRequest()

      await getCallbackHandler()(request, buildToolkit())

      expect(request.cookieAuth.set).toHaveBeenCalledWith({
        sub: 'user-sub',
        name: 'Test User',
        ipaddr: '10.0.0.1',
        session: 'session-123',
        role: undefined
      })
    })

    test('Should redirect to the login error page when the callback fails', async () => {
      client.callback.mockRejectedValue(new Error('invalid state'))
      const request = buildRequest()
      const h = buildToolkit()

      const response = await getCallbackHandler()(request, h)

      expect(request.cookieAuth.set).not.toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith('/login?error=auth_failed')
      expect(h.takeover).toHaveBeenCalled()
      expect(response).toBe('takeover-response')
    })

    test('Should set the auth cookie and redirect when posted to the route', async () => {
      client.callback.mockResolvedValue(
        buildTokenSet({ sub: 'user-sub', name: 'Test User' })
      )
      // Avoid depending on Redis, which backs the AAD cache when enabled in .env
      jest.spyOn(server.app.aadCache, 'set').mockResolvedValue(undefined)

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: callbackPath,
        payload: { code: 'auth-code', state: 'state-123' }
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe(`${baseUrl}/admin`)
      expect(headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining(`${cookieName}=`)])
      )
    })
  })

  describe('GET /sign-out', () => {
    const getSignOutHandler = () =>
      server.match('GET', '/sign-out').settings.handler

    const buildRequest = (state) => ({
      state,
      cookieAuth: { clear: jest.fn() }
    })

    test('Should drop the cached token, clear the cookie and redirect to Azure AD logout', async () => {
      const cacheDrop = jest
        .spyOn(server.app.aadCache, 'drop')
        .mockResolvedValue(undefined)
      const request = buildRequest({ [cookieName]: { sub: 'user-sub' } })
      const h = buildToolkit()

      const response = await getSignOutHandler()(request, h)

      expect(cacheDrop).toHaveBeenCalledWith('user-sub')
      expect(request.cookieAuth.clear).toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith(logoutUri)
      expect(h.takeover).toHaveBeenCalled()
      expect(response).toBe('takeover-response')
    })

    test('Should not drop the cache when there is no session cookie', async () => {
      const cacheDrop = jest.spyOn(server.app.aadCache, 'drop')
      const request = buildRequest({})
      const h = buildToolkit()

      await getSignOutHandler()(request, h)

      expect(cacheDrop).not.toHaveBeenCalled()
      expect(request.cookieAuth.clear).toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith(logoutUri)
    })

    test('Should still sign out when reading the session state throws', async () => {
      const cacheDrop = jest.spyOn(server.app.aadCache, 'drop')
      const request = {
        get state() {
          throw new Error('bad cookie')
        },
        cookieAuth: { clear: jest.fn() }
      }
      const h = buildToolkit()

      await getSignOutHandler()(request, h)

      expect(cacheDrop).not.toHaveBeenCalled()
      expect(request.cookieAuth.clear).toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith(logoutUri)
      expect(h.takeover).toHaveBeenCalled()
    })

    test('Should not drop the cache when no AAD cache is configured', async () => {
      const aadCache = server.app.aadCache
      const cacheDrop = jest.spyOn(aadCache, 'drop')
      server.app.aadCache = undefined
      const request = buildRequest({ [cookieName]: { sub: 'user-sub' } })

      try {
        await getSignOutHandler()(request, buildToolkit())
      } finally {
        server.app.aadCache = aadCache
      }

      expect(cacheDrop).not.toHaveBeenCalled()
      expect(request.cookieAuth.clear).toHaveBeenCalled()
    })
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
