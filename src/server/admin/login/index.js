import { loginController } from '~/src/server/admin/login/controller.js'

/**
 * Sets up the routes used in the /admin/login page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const login = {
  plugin: {
    name: 'login',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/admin/login',
          options: {
            auth: false
          },
          ...loginController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
