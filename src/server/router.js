import inert from '@hapi/inert'
import swagger from 'hapi-swagger'
import vision from '@hapi/vision'
import { admin } from '~/src/server/admin/index.js'
import { health } from '~/src/server/health/index.js'
import { home } from '~/src/server/home/index.js'
import { login } from '~/src/server/admin/login/index.js'
import { result } from '~/src/server/result/index.js'
import { certificates } from '~/src/server/certificates/index.js'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files.js'
import project from '~/package.json'

const swaggerOptions = {
  info: {
    title: 'MMO Check an Export Certificate',
    version: project.version
  }
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
