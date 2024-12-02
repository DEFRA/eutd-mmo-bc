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

const isProduction = config.get('isProduction')
const sessionAuth = 'session-auth'

export async function createServer() {
  const server = hapi.server(getServerOptions())

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
  server.auth.scheme('api-key', apiKeyScheme)
  server.auth.strategy('api-key-strategy', 'api-key')

  await server.register([
    pulse,
    sessionCache,
    nunjucksConfig,
    router // Register all the controllers/routes defined in src/server/router.js
  ])

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
