import {
  checkCertificateDetailsController,
  getCheckCertificateDetailsModel
} from '~/src/server/admin/checkCertificateDetails/controller.js'
import { uploadCertificateDetails } from '~/src/server/common/helpers/certificates.js'
/**
 * Sets up the routes used in the /admin/check-certificate-details page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const path = '/admin/check-certificate-details'
export const checkCertificateDetailsRoutes = [
  {
    method: 'GET',
    path,
    ...checkCertificateDetailsController
  },
  {
    method: 'POST',
    path,
    handler: async (request, h) => {
      const status = request.payload.status
      const certNumber = request.payload.certNumber
      const newCert = {
        certNumber,
        timestamp: request.payload.timestamp,
        status
      }
      const result = await uploadCertificateDetails(request, newCert)
      if (result.error) {
        const errorCode = 400
        return h
          .view(
            'admin/checkCertificateDetails/index',
            getCheckCertificateDetailsModel(request, result.error)
          )
          .code(errorCode)
      } else {
        return h.redirect(`/admin/confirmation/${certNumber}/${status}`)
      }
    }
  }
]
