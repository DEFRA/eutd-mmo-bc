import { getYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const enterIssueDateController = {
  handler(request, h) {
    const timestamp = getYarValue(request, 'timestamp')
    const splitTimestamp = timestamp ? timestamp.split('-') : ''
    const timestampDay = splitTimestamp ? splitTimestamp[2].slice(0, 2) : ''
    const timestampMonth = splitTimestamp ? splitTimestamp[1] : ''
    const timestampYear = splitTimestamp ? splitTimestamp[0] : ''
    return h.view('admin/enterIssueDate/index', {
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
      certNumber: getYarValue(request, 'certNumber'),
      timestamp,
      timestampDay,
      timestampMonth,
      timestampYear,
      status: getYarValue(request, 'status')
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
