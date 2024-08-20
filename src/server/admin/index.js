import { adminController } from '~/src/server/admin/controller.js'
import { enterCertificateNumberRoutes } from './enterCertificateNumber/index.js'
import { enterIssueDateRoutes } from './enterIssueDate/index.js'
import { enterCertificateStatusRoutes } from './enterCertificateStatus/index.js'
import { checkCertificateDetailsRoutes } from './checkCertificateDetails/index.js'
import { confirmationRoutes } from './confirmation/index.js'
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
          ...adminController
        },
        ...enterCertificateNumberRoutes,
        ...enterIssueDateRoutes,
        ...enterCertificateStatusRoutes,
        ...checkCertificateDetailsRoutes,
        ...confirmationRoutes
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
