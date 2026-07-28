import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { createAzureAdCache } from '~/src/server/common/helpers/authentication/cache.js'

// Mock dependencies
jest.mock('~/src/config/index.js', () => ({
  config: {
    get: jest.fn((key) => {
      if (key === 'redis') {
        return {
          enabled: true,
          host: '127.0.0.1',
          useSingleInstanceCache: true
        }
      }
      if (key === 'session') {
        return {
          cache: {
            name: 'session'
          }
        }
      }
      return null
    })
  }
}))

jest.mock('~/src/server/common/helpers/logging/logger.js', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }))
}))

describe('Azure AD Cache', () => {
  let mockServer

  beforeEach(() => {
    mockServer = {
      cache: jest.fn((options) => ({
        get: jest.fn(),
        set: jest.fn(),
        drop: jest.fn(),
        options
      }))
    }
    jest.clearAllMocks()
  })

  describe('createAzureAdCache', () => {
    test('Should create Redis-backed cache when Redis is enabled', async () => {
      const ttl = 24 * 60 * 60 * 1000 // 24 hours

      const cache = await createAzureAdCache(mockServer, ttl)

      expect(mockServer.cache).toHaveBeenCalledWith({
        segment: 'aad-cache',
        expiresIn: ttl,
        cache: 'session' // Uses session cache name from config
      })
      expect(cache).toBeDefined()
      expect(cache.options).toEqual({
        segment: 'aad-cache',
        expiresIn: ttl,
        cache: 'session'
      })
    })

    test('Should use default TTL if not specified', async () => {
      await createAzureAdCache(mockServer)

      expect(mockServer.cache).toHaveBeenCalled()
      const options = mockServer.cache.mock.calls[0][0]
      expect(options.expiresIn).toBe(24 * 60 * 60 * 1000) // 1 day default
    })

    test('Should return cache instance with standard methods', async () => {
      const cache = await createAzureAdCache(mockServer)

      expect(cache.get).toBeDefined()
      expect(cache.set).toBeDefined()
      expect(cache.drop).toBeDefined()
    })
  })
})
