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
      certNumber: request.yar.get('certNumber'),
      timestamp: request.yar.get('timestamp'),
      status: request.yar.get('status')
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
