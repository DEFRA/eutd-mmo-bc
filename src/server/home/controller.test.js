import { createServer } from '~/src/server/index.js'

describe('#homeController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('Should load the home page', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(payload).toContain(
      'Enter the certificate number you wish to validate'
    )
    expect(payload).toContain('Certificate number')
    expect(payload).toContain('Continue')
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
