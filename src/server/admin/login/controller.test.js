import { createServer } from '~/src/server/index.js'
import { config } from '~/src/config/index.js'

describe('#loginController', () => {
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

  test('Should load the login page', async () => {
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/login'
    })

    expect(payload).toContain('Sign in with your credentials')
    expect(payload).toContain('Username')
    expect(payload).toContain('Password')
    expect(payload).toContain('Continue')
  })

  test('Should not redirect the user if username and password are incorrect', async () => {
    const { request, statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/login',
      payload: {
        username: 'test',
        password: 'test'
      }
    })

    expect(request.url.toString()).toContain('/admin/login')
    expect(statusCode).toBe(302)
  })

  test('Should not redirect the user if username is correct but the password is invalid', async () => {
    const { request, statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/login',
      payload: {
        username: 'admin',
        password: 'test'
      }
    })

    expect(request.url.toString()).toContain('/admin/login')
    expect(statusCode).toBe(302)
  })

  test('Should redirect the user with correct credentials', async () => {
    jest
      .spyOn(config, 'get')
      .mockReturnValue([{ username: 'admin', password: 'test' }])
    const { request, statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/login',
      payload: {
        username: 'admin',
        password: 'test'
      }
    })

    expect(request.url.toString()).toContain('/admin')
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
