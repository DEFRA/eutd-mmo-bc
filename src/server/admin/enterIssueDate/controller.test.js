import { createServer } from '~/src/server/index.js'
import * as yarHelpers from '~/src/server/common/helpers/yar-helper.js'

describe('#enterIssueDateController', () => {
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

  test('Should load the enter-issue-date page', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(payload).toContain('What is the Issue Date?')
  })

  test('Should load the enter-issue-date page with values if present in yar', async () => {
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW15')
      .mockReturnValueOnce('COMPLETE')
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(payload).toContain('What is the Issue Date?')
    // prettier-ignore
    // eslint-disable-next-line
    expect(payload).toContain('value=\"02\"')
    // prettier-ignore
    // eslint-disable-next-line
    expect(payload).toContain('value=\"05\"')
    // prettier-ignore
    // eslint-disable-next-line
    expect(payload).toContain('value=\"2024\"')
    expect(payload).toContain('GBR-2018-CC-123A4AW15')
    expect(payload).toContain('COMPLETE')
  })

  test('Should set the yar value and redirect on POST', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-year': '2023',
        'timestamp-month': '05',
        'timestamp-day': '01'
      }
    })

    expect(yarHelpers.setYarValue.mock.calls[0][2]).toBe(
      '2023-05-01T00:00:00.000Z'
    )
    expect(statusCode).toBe(302)
  })

  test('Should set the yar value as undefined if one of the values is missing', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-year': '2023',
        'timestamp-month': '05'
      }
    })

    expect(yarHelpers.setYarValue.mock.calls[0][2]).toBeUndefined()
    expect(statusCode).toBe(400)
  })

  test('Should throw an error is date is in the future', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-day': '20',
        'timestamp-month': '05',
        'timestamp-year': '4023'
      }
    })
    expect(payload).toContain('Incorrect date. Enter a valid date to proceed')
    expect(statusCode).toBe(400)
  })

  test('Should throw an error is date is invalid', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-day': '31',
        'timestamp-month': '04',
        'timestamp-year': '2001'
      }
    })
    expect(payload).toContain(
      'Date cannot be blank. Enter a valid date to proceed'
    )
    expect(statusCode).toBe(400)
  })
})

describe('enterIssueDateController crumb', () => {
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
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-year': '2023',
        'timestamp-month': '05',
        'timestamp-day': '01'
      }
    })

    expect(statusCode).toBe(403)
  })

  test('Should return a 302 with crumb present', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')

    // needed to get the crumb token from the server
    const res = await server.inject({
      method: 'GET',
      url: '/admin/enter-issue-date',
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
      url: '/admin/enter-issue-date',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        'timestamp-year': '2023',
        'timestamp-month': '05',
        'timestamp-day': '01',
        crumb
      },
      headers: {
        cookie: 'crumb=' + crumb
      }
    })

    expect(yarHelpers.setYarValue.mock.calls[0][2]).toBe(
      '2023-05-01T00:00:00.000Z'
    )
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
