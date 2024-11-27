import { createServer } from '~/src/server/index.js'
import { config } from '~/src/config/index.js'
import Cheerio from 'cheerio'

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
      url: '/login'
    })

    expect(payload).toContain('Sign in with your credentials')
    expect(payload).toContain('Username')
    expect(payload).toContain('Password')
    expect(payload).toContain('Continue')
  })

  test('Should not redirect the user if username and password are incorrect', async () => {
    const { request, statusCode } = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'test',
        password: 'test'
      }
    })

    expect(request.url.toString()).toContain('/login')
    expect(statusCode).toBe(302)
  })

  test('Should not redirect the user if username and password are incorrect and display error message', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: '',
        password: ''
      }
    })

    const { headers, statusCode } = response

    expect(headers.location).toContain('/login') // Check if redirect is to the correct path
    expect(headers.location).toContain('error=true') // Check if the error=true is present in the Location header
    expect(statusCode).toBe(302)
  })

  test('Should display error message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/login?error=true' // Simulate accessing the login page with an error query parameter
    })

    const { result } = response

    const $ = Cheerio.load(result)

    const errorMessage = $('ul.govuk-error-summary__list').text().trim()
    expect(errorMessage).toBe('Incorrect user name or password')
  })

  test('Should not redirect the user if username is correct but the password is invalid', async () => {
    const { request, statusCode } = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'admin',
        password: 'test'
      }
    })

    expect(request.url.toString()).toContain('/login')
    expect(statusCode).toBe(302)
  })

  test('Should redirect the user with correct credentials', async () => {
    jest
      .spyOn(config, 'get')
      .mockReturnValue([{ username: 'admin', password: 'test' }])
    const { statusCode, raw } = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'admin',
        password: 'test'
      }
    })

    expect(raw.res._shot.headers.location).toBe('/admin')
    expect(statusCode).toBe(302)
  })

  test('Should redirect the user when logging out', async () => {
    const { raw } = await server.inject({
      method: 'GET',
      url: '/sign-out'
    })

    expect(raw.res._shot.headers.location).toBe('/login')
  })
})

describe('loginController crumb', () => {
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
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'admin',
        password: 'test'
      }
    })

    expect(statusCode).toBe(403)
  })

  test('Should return a 302 with crumb present', async () => {
    // needed to get the crumb token from the server
    const res = await server.inject({
      method: 'GET',
      url: '/login'
    })

    const crumb = res.headers['set-cookie'][0]
      .match(/crumb=([\w",;\\-]*);\s/)[1]
      .trim()

    jest
      .spyOn(config, 'get')
      .mockReturnValue([{ username: 'admin', password: 'test' }])
    const { statusCode, raw } = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'admin',
        password: 'test',
        crumb
      },
      headers: {
        cookie: 'crumb=' + crumb
      }
    })

    expect(raw.res._shot.headers.location).toBe('/admin')
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
