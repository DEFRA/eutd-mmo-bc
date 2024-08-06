/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler(request, h) {
    return h.view('home/index', {
      pageTitle: 'GOV.UK - Check an Export Certificate',
<<<<<<< HEAD
      heading: 'Enter the certificate number you wish to validate',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Validate Certificate Number'
        }
      ]
=======
      heading: 'Home'
>>>>>>> 9858d5d (adding home page content)
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
