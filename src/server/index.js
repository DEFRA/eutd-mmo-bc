import path from 'path'
import hapi from '@hapi/hapi'

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

const isProduction = config.get('isProduction')

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

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register(cookie)

  server.auth.strategy('session-auth', 'cookie', {
    cookie: {
      name: 'session-auth',
      password: config.get('authCookiePassword'),
      isSecure: process.env.NODE_ENV === 'production'
    },
    redirectTo: '/admin/login',
    validate: (_request, session) =>
      session.authenticated ? { isValid: true } : { isValid: false }
  })

  server.auth.default('session-auth')

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
        return h.unauthenticated(new Error('Invalid API key'), {
          credentials: null
        })
      }

      const credentials = { apiKey }
      return h.authenticated({ credentials })
    }
  }
}
