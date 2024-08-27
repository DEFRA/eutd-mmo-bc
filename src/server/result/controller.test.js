import { createServer } from '~/src/server/index.js'

describe('#resultController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('Should load the result page with an invalid certififcate', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/result'
    })

    expect(payload).toContain('The certificate number entered is not valid')
    expect(payload).toContain('Search again')
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
