import { Cluster, Redis } from 'ioredis'

import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

/**
 * Setup Redis and provide a redis client
 *
 * Local development - 1 Redis instance
 * Environments - Elasticache / Redis Cluster with username and password
 * @param {RedisConfig} redisConfig - Redis config
 * @returns {Cluster | Redis}
 */
export function buildRedisClient(redisConfig) {
  const port = 6379
  const db = 0
  const keyPrefix = redisConfig.keyPrefix
  const host = redisConfig.host
  let redisClient

  if (redisConfig.useSingleInstanceCache) {
    redisClient = new Redis({
      port,
      host,
      db,
      keyPrefix
    })
  } else {
    redisClient = new Cluster(
      [
        {
          host,
          port
        }
      ],
      {
        keyPrefix,
        slotsRefreshTimeout: 10000,
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
          username: redisConfig.username,
          password: redisConfig.password,
          db,
          tls: {}
        }
      }
    )
  }

  redisClient.on('connect', () => {
    const logger = createLogger()
    logger.info('Connected to Redis server')
  })

  redisClient.on('error', (error) => {
    const logger = createLogger()
    logger.error(`Redis connection error ${error}`)
  })

  return redisClient
}

/**
 * @typedef {object} RedisConfig
 * @property {boolean} enabled
 * @property {string} host
 * @property {string} username
 * @property {string} password
 * @property {string} keyPrefix
 * @property {boolean} useSingleInstanceCache
 */
