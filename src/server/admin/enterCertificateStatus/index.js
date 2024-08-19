import { enterCertificateStatusController } from '~/src/server/admin/enterCertificateStatus/controller.js'
import { setYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * Sets up the routes used in the /admin/enter-certificate-status page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const enterCertificateStatusRoutes = [
  {
    method: 'GET',
    path: '/admin/enter-certificate-status',
    ...enterCertificateStatusController
  },
  {
    method: 'POST',
    path: '/admin/enter-certificate-status',
    handler: (request, h) => {
      setYarValue(request, 'status', request.payload.status)
      return h.redirect('/admin/check-certificate-details')
    }
  }
]
