import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest
} from '@jest/globals'
import AuthenticationClient from '~/src/server/common/helpers/authentication/client.js'
import { Issuer } from 'openid-client'

// Mock openid-client
jest.mock('openid-client', () => {
  const mockClient = {
    authorizationUrl: jest.fn(),
    callback: jest.fn()
  }

  const mockIssuer = {
    Client: jest.fn(() => mockClient)
  }

  return {
    Issuer: {
      discover: jest.fn(() => mockIssuer),
      defaultHttpOptions: {}
    },
    __mockClient: mockClient,
    __mockIssuer: mockIssuer
  }
})

// Mock config
jest.mock('~/src/config/index.js', () => ({
  config: {
    get: jest.fn((key) => {
      if (key === 'azureAd') {
        return {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          tenantId: 'test-tenant-id'
        }
      }
      return null
    })
  }
}))

// Mock logger
jest.mock('~/src/server/common/helpers/logging/logger.js', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }))
}))

describe('AuthenticationClient', () => {
  beforeEach(() => {
    // Clear singleton instance before each test
    AuthenticationClient.clearClient()
    jest.clearAllMocks()
  })

  afterEach(() => {
    AuthenticationClient.clearClient()
  })

  describe('getClient', () => {
    test('Should create and return OpenID Connect client', async () => {
      const client = await AuthenticationClient.getClient()

      expect(Issuer.discover).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/test-tenant-id/.well-known/openid-configuration'
      )
      expect(client).toBeDefined()
    })

    test('Should cache client instance after first call', async () => {
      const client1 = await AuthenticationClient.getClient()
      const client2 = await AuthenticationClient.getClient()

      expect(client1).toBe(client2)
      expect(Issuer.discover).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearClient', () => {
    test('Should clear cached client instance', async () => {
      await AuthenticationClient.getClient()
      expect(Issuer.discover).toHaveBeenCalledTimes(1)

      AuthenticationClient.clearClient()

      await AuthenticationClient.getClient()
      expect(Issuer.discover).toHaveBeenCalledTimes(2)
    })
  })
})
