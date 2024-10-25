import { resultController } from '~/src/server/result/controller.js'

/**
 * Sets up the routes used in the result page.
 * These routes are registered in src/server/router.js.
 */

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const result = {
  plugin: {
    name: 'result',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/result',
          options: {
            auth: {
              mode: 'try'
            }
          },
          ...resultController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
