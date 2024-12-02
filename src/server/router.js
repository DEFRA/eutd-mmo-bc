import inert from '@hapi/inert'
import swagger from 'hapi-swagger'
import vision from '@hapi/vision'
import { admin } from '~/src/server/admin/index.js'
import { health } from '~/src/server/health/index.js'
import { home } from '~/src/server/home/index.js'
import { login } from '~/src/server/login/index.js'
import { result } from '~/src/server/result/index.js'
import { certificates } from '~/src/server/certificates/index.js'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files.js'

const swaggerOptions = {
  info: {
    title: 'MMO Check an Export Certificate',
    description:
      'An offical Marine Management Organisation Developer API for Checking the validity of an Export Certificate',
    version: '0.0.0',
    contact: {
      name: 'MMO Developer Support',
      url: 'https://marinemanagement.org.uk/support',
      email: 'support@marinemanagement.org.uk'
    },
    license: {
      name: 'OGL v3.0',
      url: 'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    }
  },
  tags: [
    {
      name: ' Validation',
      description: 'APIs for validating Export Certificate Details'
    },
    {
      name: 'Register Management',
      description: 'APIs for managing the known Export Certificate Details'
    }
  ],
  grouping: 'tags',
  OAS: 'v3.0',
  schemes: ['http', 'https'],
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      'x-keyPrefix': 'ApiKeyAuth '
    }
  },
  security: [{ ApiKeyAuth: [] }]
}

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([
        inert,
        vision,
        { plugin: swagger, options: swaggerOptions }
      ])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([home, admin, login, certificates, result])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
