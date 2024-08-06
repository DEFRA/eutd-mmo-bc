import { adminController } from '~/src/server/admin/controller.js'

/**
 * Sets up the routes used in the /admin page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const admin = {
  plugin: {
    name: 'admin',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/admin',
          options: {
            auth: 'simple'
          },
          ...adminController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
