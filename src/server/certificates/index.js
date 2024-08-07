import { certificatesController } from '~/src/server/certificates/controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const certificates = {
  plugin: {
    name: 'certificates',
    register(server) {
      server.route({
        method: 'GET',
        path: '/certificates',
        options: {
          auth: false
        },
        ...certificatesController
      })
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
