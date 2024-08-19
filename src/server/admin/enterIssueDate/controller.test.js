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
    // eslint-disable-next-line
    expect(payload).toContain('value=\"02\"')
    // eslint-disable-next-line
    expect(payload).toContain('value=\"05\"')
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
      '2023-05-01T00:00:00+01:00'
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
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
