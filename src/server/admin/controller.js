/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const adminController = {
  handler(request, h) {
    return h.view('admin/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      heading: 'Enter Certificate Details',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Enter Certificate Details'
        }
      ]
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
