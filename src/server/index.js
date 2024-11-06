import path from 'path'
import hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { config } from '~/src/config/index.js'
import { nunjucksConfig } from '~/src/config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger.js'
import { catchAll } from '~/src/server/common/helpers/errors.js'
import { secureContext } from '~/src/server/common/helpers/secure-context/index.js'
import { sessionCache } from '~/src/server/common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'
import { pulse } from '~/src/server/common/helpers/pulse.js'
import cookie from '@hapi/cookie'
import { s3ClientPlugin } from '~/src/server/common/helpers/repository/S3Bucket.js'

const isProduction = config.get('isProduction')
const sessionAuth = 'session-auth'

export async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      },
      json: {
        space: '2'
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: getCacheEngine()
      }
    ]
  })

  await server.register([requestLogger, s3ClientPlugin])

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register(cookie)

  server.auth.strategy(sessionAuth, 'cookie', {
    cookie: {
      name: sessionAuth,
      password: config.get('authCookiePassword'),
      isSecure: process.env.NODE_ENV === 'production',
      ttl: 1800000,
      clearInvalid: true,
      path: '/'
    },
    keepAlive: true,
    redirectTo: '/login',
    validate: (_request, session) =>
      session.authenticated ? { isValid: true } : { isValid: false }
  })

  server.auth.default(sessionAuth)

  // Register the custom authentication scheme
  server.auth.scheme('api-key', apiKeyScheme)

  // Define an authentication strategy using the custom scheme
  server.auth.strategy('api-key-strategy', 'api-key')

  await server.register([
    pulse,
    sessionCache,
    nunjucksConfig,
    router // Register all the controllers/routes defined in src/server/router.js
  ])

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
