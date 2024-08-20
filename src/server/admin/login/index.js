import { loginController } from '~/src/server/admin/login/controller.js'
import { config } from '~/src/config/index.js'
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
        },
        {
          method: 'POST',
          path: '/admin/login',
          options: {
            auth: false
          },
          handler: (request, h) => {
            const { username, password } = request.payload
            const users = config.get('users')
            let validUser = true
            const userObj = users.find(
              (userObj) => userObj.username === username
            )

            if (!userObj) {
              validUser = false
            }

            if (validUser && userObj?.password !== password) {
              validUser = false
            }

            if (validUser) {
              request.cookieAuth.set({ authenticated: true })
              return h.redirect('/admin')
            } else {
              return h.redirect('/admin/login').takeover()
            }
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
