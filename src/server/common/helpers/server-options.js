import path from 'path'
import { config } from '~/src/config/index.js'
import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'

export const getServerOptions = () => ({
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
