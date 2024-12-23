import { createServer } from '~/src/server/index.js'
import * as yarHelpers from '~/src/server/common/helpers/yar-helper.js'

describe('#confirmationController', () => {
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

  test('Should load the confirmation page with values present in yar', async () => {
    const clearSpy = jest.spyOn(yarHelpers, 'clearYarValue')
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/confirmation/GBR-2018-CC-123A4AW15/COMPLETE',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(clearSpy.mock.calls[0][1]).toBe('certNumber')
    expect(clearSpy.mock.calls[1][1]).toBe('timestamp')
    expect(clearSpy.mock.calls[2][1]).toBe('status')
    expect(payload).toContain('Certificate Details added - Completed')
    expect(payload).toContain(
      'Your certificate number is<br><strong>GBR-2018-CC-123A4AW15</strong>'
    )
  })

  test('Should load the confirmation page with a VOID', async () => {
    const clearSpy = jest.spyOn(yarHelpers, 'clearYarValue')
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/confirmation/GBR-2018-CC-123A4AW15/VOID',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(clearSpy.mock.calls[0][1]).toBe('certNumber')
    expect(clearSpy.mock.calls[1][1]).toBe('timestamp')
    expect(clearSpy.mock.calls[2][1]).toBe('status')
    expect(payload).toContain('Certificate Details added - Voided')
    expect(payload).toContain(
      'Your certificate number is<br><strong>GBR-2018-CC-123A4AW15</strong>'
    )
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
