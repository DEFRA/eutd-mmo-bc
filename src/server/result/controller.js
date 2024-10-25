/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const resultController = {
  handler(request, h) {
    return h.view('result/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
      heading: 'Enter Certificate Details',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Validate Certificate Number'
        }
      ],
      loggedIn: request.auth.isAuthenticated
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
