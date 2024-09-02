import { enterCertificateNumberController } from '~/src/server/admin/enterCertificateNumber/controller.js'
import {
  setYarValue,
  getYarValue
} from '~/src/server/common/helpers/yar-helper.js'
import { getList } from '../../common/helpers/certificates.js'

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
    handler: async (request, h) => {
      const list = await getList(request)
      if (
        request.payload.certNumber === '' ||
        list.findIndex(
          (listItem) => listItem.certNumber === request.payload.certNumber
        ) !== -1
      ) {
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
            errorMessage:
              request.payload.certNumber === ''
                ? 'The certificate number cannot be empty'
                : 'The certificate number already exists'
          })
          .code(400)
      }
      setYarValue(request, 'certNumber', request.payload.certNumber)
      return h.redirect('/admin/enter-issue-date')
    }
  }
]
