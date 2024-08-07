import { enterCertificateNumberController } from '~/src/server/admin/enterCertificateNumber/controller.js'
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
      const { certNumber } = request.payload
      request.yar.set('certNumber', certNumber)
      return h.redirect('/admin/enter-issue-date')
    }
  }
]
