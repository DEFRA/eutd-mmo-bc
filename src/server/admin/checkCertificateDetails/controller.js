import { getYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const checkCertificateDetailsController = {
  handler(request, h) {
    return h.view('admin/checkCertificateDetails/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      heading: 'Check the details',
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
