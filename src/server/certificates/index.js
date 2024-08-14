import {
  certificatesController,
  updateCertificateDetails,
  removeCertificateDetails,
  getCertificates
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
        method: 'GET',
        path: '/api/certificates',
        options: {
          auth: 'api-key-strategy' // Need to update to api-key-strategy
        },
        ...getCertificates
      })

      server.route({
        method: 'PUT',
        path: '/api/certificates/{certificateNumber}',
        options: {
          auth: 'api-key-strategy'
        },
        ...updateCertificateDetails
      })

      server.route({
        method: 'DELETE',
        path: '/api/certificates/{certificateNumber}',
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
