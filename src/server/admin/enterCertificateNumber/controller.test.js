import { createServer } from '~/src/server/index.js'
import * as yarHelpers from '~/src/server/common/helpers/yar-helper.js'

describe('#enterCerficateNumberController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
    jest.restoreAllMocks()
  })

  test('Should load the enter-certificate-number page with values present in yar', async () => {
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW15')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('COMPLETE')
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(payload).toContain('Enter the certificate number')
    expect(payload).toContain('2024-05-02T00:00:00.000Z')
    expect(payload).toContain('GBR-2018-CC-123A4AW15')
    expect(payload).toContain('COMPLETE')
  })

  test('Should set the yar value and redirect on POST', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: 'GBR-2018-CC-123A4AW22'
      }
    })

    expect(yarHelpers.setYarValue.mock.calls[0][2]).toBe(
      'GBR-2018-CC-123A4AW22'
    )
    expect(statusCode).toBe(302)
  })

  test('Should throw an error if certificate number is empty', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: ''
      }
    })

    expect(payload).toContain('The certificate number cannot be empty')
    expect(statusCode).toBe(400)
  })
})

describe('enterCertificateNumberController crumb', () => {
  let server
  const originalEnv = process.env

  beforeAll(async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production'
    }
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  test('Should return a 403 with no crumb present', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: 'GBR-2018-CC-123A4AW22'
      }
    })

    expect(statusCode).toBe(403)
  })

  test('Should return a 302 with crumb present', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')

    // needed to get the crumb token from the server
    const res = await server.inject({
      method: 'GET',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    const crumb = res.headers['set-cookie'][0]
      .match(/crumb=([\w",;\\-]*);\s/)[1]
      .trim()

    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/enter-certificate-number',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: 'GBR-2018-CC-123A4AW22',
        crumb
      },
      headers: {
        cookie: 'crumb=' + crumb
      }
    })

    expect(yarHelpers.setYarValue.mock.calls[0][2]).toBe(
      'GBR-2018-CC-123A4AW22'
    )
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
