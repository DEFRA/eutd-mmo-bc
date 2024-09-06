import { enterCertificateNumberController } from '~/src/server/admin/enterCertificateNumber/controller.js'
import {
  setYarValue,
  getYarValue
} from '~/src/server/common/helpers/yar-helper.js'

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
      if (request.payload.certNumber === '') {
        const badRequestStatusCode = 400
        return h
          .view('admin/enterCertificateNumber/index', {
            pageTitle: 'Error: GOV.UK - Check an Export Certificate',
            breadcrumbs: [
              {
                text: 'Home',
                href: '/admin'
              },
              {
                text: 'Enter Certificate Details'
              }
            ],
            certNumber: request.payload.certNumber,
            timestamp: getYarValue(request, 'timestamp'),
            status: getYarValue(request, 'status'),
            errorMessage: 'The certificate number cannot be empty'
          })
          .code(badRequestStatusCode)
      }
      setYarValue(request, 'certNumber', request.payload.certNumber)
      return h.redirect('/admin/enter-issue-date')
    }
  }
]
