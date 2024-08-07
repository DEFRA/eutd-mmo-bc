/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const confirmationController = {
  handler(request, h) {
    const certNumber = request.yar.get('certNumber')
    const timestamp = request.yar.get('timestamp')
    const status = request.yar.get('status')

    request.yar.clear('certNumber')
    request.yar.clear('timestamp')
    request.yar.clear('status')

    return h.view('admin/confirmation/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/admin'
        },
        {
          text: 'Enter Certificate Details'
        }
      ],
      certNumber,
      timestamp,
      status
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
