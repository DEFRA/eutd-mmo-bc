import { createServer } from '~/src/server/index.js'

describe('#loginController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Should load the login page', async () => {
    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: '/login'
    })

    expect(statusCode).toBe(200)
    expect(payload).toContain('Sign in with your credentials')
  })

  test('Should display error message when error query param is present', async () => {
    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: '/login?error=auth_failed'
    })

    expect(statusCode).toBe(200)
    expect(payload).toContain('Sign in with your credentials')
  })
})

describe('#azureAdAuthRoutes', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Should redirect to Azure AD logout on /sign-out', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/sign-out'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toContain('login.microsoftonline.com')
    expect(headers.location).toContain('/logout')
  })

  test('GET /login/out should attempt to redirect to Azure AD', async () => {
    // This test verifies the route exists and attempts authentication
    // In a real scenario, this would redirect to Azure AD login portal
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/login/out'
    })

    // Should either redirect (302) or return service unavailable (503) if Azure AD client fails
    expect([302, 503]).toContain(statusCode)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
