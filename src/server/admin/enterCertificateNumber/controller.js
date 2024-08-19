import { getYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const enterCertificateNumberController = {
  handler(request, h) {
    return h.view('admin/enterCertificateNumber/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      heading: 'Enter the certificate number',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/admin'
        },
        {
          text: 'Enter Certificate Details'
        }
      ],
      certNumber: getYarValue(request, 'certNumber'),
      timestamp: getYarValue(request, 'timestamp'),
      status: getYarValue(request, 'status')
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
