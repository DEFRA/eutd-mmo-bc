/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const enterIssueDateController = {
  handler(request, h) {
    const timestamp = request.yar.get('timestamp')
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
      certNumber: request.yar.get('certNumber'),
      timestamp,
      timestampDay,
      timestampMonth,
      timestampYear,
      status: request.yar.get('status')
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
