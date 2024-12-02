import { loginController } from '~/src/server/login/controller.js'
import { config } from '~/src/config/index.js'
/**
 * Sets up the routes used in the /login page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const path = '/login'
export const login = {
  plugin: {
    name: 'login',
    register(server) {
      server.route([
        {
          method: 'GET',
          path,
          options: {
            auth: {
              mode: 'try'
            }
          },
          ...loginController
        },
        {
          method: 'POST',
          path,
          options: {
            auth: {
              mode: 'try'
            }
          },
          handler: (request, h) => {
            const { username, password } = request.payload
            const users = config.get('users')
            let validUser = true
            const userObj = users.find((user) => user.username === username)

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
              return h.redirect('/login?error=true').takeover()
            }
          }
        },
        {
          method: 'GET',
          path: '/sign-out',
          options: {
            auth: {
              mode: 'try'
            }
          },
          handler(request, h) {
            request.cookieAuth.clear()
            return h.redirect('/login').takeover()
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
