import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

const oneDay = 1000 * 60 * 60 * 24

/**
 * Create a Redis-backed cache for Azure AD tokens
 * @param {import('@hapi/hapi').Server} server - Hapi server instance
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise<import('@hapi/hapi').ServerCache>}
 */
export function createAzureAdCache(server, ttl = oneDay) {
  const redisConfig = config.get('redis')
  const sessionCacheName = config.get('session').cache.name

  if (!redisConfig.enabled) {
    logger.info('Redis disabled - using in-memory cache for AAD tokens')
    return server.cache({
      segment: 'aad-cache',
      expiresIn: ttl
    })
  }

  logger.info('Setting up Redis cache for Azure AD tokens')

  const cacheOptions = {
    segment: 'aad-cache',
    expiresIn: ttl
  }

  // Use the same Redis connection as session cache if available
  if (redisConfig.useSingleInstanceCache) {
    cacheOptions.cache = sessionCacheName
  }

  const cache = server.cache(cacheOptions)

  logger.info('Azure AD token cache configured')

  return cache
}

/**
 * @import { Server, ServerCache } from '@hapi/hapi'
 */
