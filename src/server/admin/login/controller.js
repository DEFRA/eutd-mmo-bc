/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const loginController = {
  handler(request, h) {
    return h.view('admin/login/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      heading: 'Sign in with your credentials',
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
