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
      certNumber: request.yar.get('certNumber'),
      timestamp: request.yar.get('timestamp'),
      status: request.yar.get('status')
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
