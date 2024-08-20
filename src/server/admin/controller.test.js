import { createServer } from '~/src/server/index.js'

describe('#adminController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('Should redirect to the login page if not authorized', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin'
    })

    expect(payload).toContain('You are being redirected')
  })

  test('Should load the admin page if authenticated', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(payload).toContain('Use this service to')
    expect(payload).toContain('Start now')
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
