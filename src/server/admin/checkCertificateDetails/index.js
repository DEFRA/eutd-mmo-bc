import { checkCertificateDetailsController } from '~/src/server/admin/checkCertificateDetails/controller.js'
/**
 * Sets up the routes used in the /admin/check-certificate-details page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const checkCertificateDetailsRoutes = [
  {
    method: 'GET',
    path: '/admin/check-certificate-details',
    ...checkCertificateDetailsController
  },
  {
    method: 'POST',
    path: '/admin/check-certificate-details',
    handler: (request, h) => {
      return h.redirect('/admin/confirmation')
    }
  }
]
