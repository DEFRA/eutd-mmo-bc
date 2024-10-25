import {
  getYarValue,
  clearYarValue
} from '~/src/server/common/helpers/yar-helper.js'

/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const confirmationController = {
  handler(request, h) {
    const certNumber = getYarValue(request, 'certNumber')
    const timestamp = getYarValue(request, 'timestamp')
    const status = getYarValue(request, 'status')

    clearYarValue(request, 'certNumber')
    clearYarValue(request, 'timestamp')
    clearYarValue(request, 'status')

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
      panelTitle:
        status === 'VOID'
          ? 'Certificate Details added - Voided'
          : 'Certificate Details added - Completed',
      loggedIn: request.auth.isAuthenticated
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
