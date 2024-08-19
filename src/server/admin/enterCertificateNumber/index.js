import { enterCertificateNumberController } from '~/src/server/admin/enterCertificateNumber/controller.js'
import { setYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * Sets up the routes used in the /admin/enter-certificate-number page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const enterCertificateNumberRoutes = [
  {
    method: 'GET',
    path: '/admin/enter-certificate-number',
    ...enterCertificateNumberController
  },
  {
    method: 'POST',
    path: '/admin/enter-certificate-number',
    handler: (request, h) => {
      setYarValue(request, 'certNumber', request.payload.certNumber)
      return h.redirect('/admin/enter-issue-date')
    }
  }
]
