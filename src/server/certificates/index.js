import {
  certificatesController,
  updateCertificateDetails,
  removeCertificateDetails
} from '~/src/server/certificates/controller.js'

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
          auth: false // Need to update to api-key-strategy
        },
        ...certificatesController
      })

      server.route({
        method: 'PUT',
        path: '/certificates/{certificateNumber}',
        options: {
          auth: 'api-key-strategy'
        },
        ...updateCertificateDetails
      })

      server.route({
        method: 'DELETE',
        path: '/certificates/{certificateNumber}',
        options: {
          auth: 'api-key-strategy'
        },
        ...removeCertificateDetails
      })
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
