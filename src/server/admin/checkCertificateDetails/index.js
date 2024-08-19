import { checkCertificateDetailsController } from '~/src/server/admin/checkCertificateDetails/controller.js'
import { uploadCertificateDetails } from '~/src/server/common/helpers/certificates.js'
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
    handler: async (request, h) => {
      const newCert = {
        certNumber: request.payload.certNumber,
        timestamp: request.payload.timestamp,
        status: request.payload.status
      }
      const result = await uploadCertificateDetails(newCert)
      if (!result) {
        return h.redirect('/admin/check-certificate-details').takeover()
      } else {
        return h.redirect('/admin/confirmation')
      }
    }
  }
]
