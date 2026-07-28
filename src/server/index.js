import hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { config } from '~/src/config/index.js'
import { nunjucksConfig } from '~/src/config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger.js'
import { catchAll } from '~/src/server/common/helpers/errors.js'
import { secureContext } from '~/src/server/common/helpers/secure-context/index.js'
import { sessionCache } from '~/src/server/common/helpers/session-cache/session-cache.js'
import { getServerOptions } from '~/src/server/common/helpers/server-options.js'
import { pulse } from '~/src/server/common/helpers/pulse.js'
import cookie from '@hapi/cookie'
import { s3ClientPlugin } from '~/src/server/common/helpers/repository/S3Bucket.js'
import crumb from '@hapi/crumb'
import { createAzureAdCache } from '~/src/server/common/helpers/authentication/cache.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()
const isProduction = config.get('isProduction')
const sessionAuth = 'session-auth'

export async function createServer() {
  const server = hapi.server(getServerOptions())

  await server.register([requestLogger, s3ClientPlugin])

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register(cookie)

  await server.register([pulse, sessionCache, nunjucksConfig])

  // Create Azure AD token cache after sessionCache is registered (required for Redis backend)
  logger.info('Setting up Azure AD authentication')
  const aadCache = await createAzureAdCache(server)

  // Configure Azure AD authentication strategy before setting default
  setupAzureAdAuth(server, aadCache)

  // Set default auth and register API key scheme
  server.auth.default(sessionAuth)
  server.auth.scheme('api-key', apiKeyScheme)
  server.auth.strategy('api-key-strategy', 'api-key')

  // Register routes after auth is configured
  await server.register(router)

  await server.register({
    plugin: crumb,
    options: {
      enforce: process.env.NODE_ENV !== 'test',
      cookieOptions: {
        isSecure: process.env.NODE_ENV !== 'development'
      }
    }
  })

  server.ext('onPreResponse', catchAll)

  return server
}

const apiKeyScheme = () => {
  return {
    authenticate: (request, h) => {
      const apiKey = request.headers['x-api-key']

      if (!apiKey || apiKey !== config.get('apiAuth')) {
        const error = Boom.unauthorized('Invalid API key')
        error.output.payload = {
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid API key'
        }
        error.output.headers['content-type'] = 'application/json' // Ensure JSON response
        return h.unauthenticated(error)
      }

      const credentials = { apiKey }
      return h.authenticated({ credentials })
    }
  }
}

function setupAzureAdAuth(server, aadCache) {
  const azureAdConfig = config.get('azureAd')
  const baseUrl = config.get('baseUrl')
  const outboundPath = '/login/out'
  const cookieName = azureAdConfig.cookieName
  const authCookiePassword = config.get('authCookiePassword')

  logger.info(`Azure AD auth: cookie name=${cookieName}, baseUrl=${baseUrl}`)

  server.auth.strategy(sessionAuth, 'cookie', {
    cookie: {
      name: cookieName,
      password: authCookiePassword,
      isSecure: process.env.NODE_ENV !== 'development',
      isSameSite: 'Lax',
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    },
    appendNext: true,
    redirectTo: `${baseUrl}${outboundPath}`,
    validate: async (request) => {
      logger.debug('Validating Azure AD session')

      let cacheKey
      try {
        cacheKey = request.state[cookieName]?.sub
      } catch (error) {
        logger.error('Error extracting cache key from session', error)
        return { isValid: false }
      }

      if (!cacheKey) {
        logger.debug('No cache key found in session')
        return { isValid: false }
      }

      const cacheData = await aadCache.get(cacheKey)

      if (cacheData && typeof cacheData === 'object') {
        const nowTimestamp = Date.now() / 1000
        const isValid = cacheData.claims && cacheData.claims.exp > nowTimestamp

        if (!isValid) {
          logger.debug('Token expired for cache key', cacheKey)
        }

        return { isValid }
      }

      logger.debug('No valid cache data found for key', cacheKey)
      return { isValid: false }
    }
  })

  // Store cache instance on server for route access
  server.app.aadCache = aadCache

  logger.info('Azure AD authentication strategy configured')
}
