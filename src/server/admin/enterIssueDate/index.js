import { enterIssueDateController } from '~/src/server/admin/enterIssueDate/controller.js'
import { formatISO } from 'date-fns'
import { setYarValue } from '~/src/server/common/helpers/yar-helper.js'

/**
 * Sets up the routes used in the /admin/enter-issue-date page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const enterIssueDateRoutes = [
  {
    method: 'GET',
    path: '/admin/enter-issue-date',
    ...enterIssueDateController
  },
  {
    method: 'POST',
    path: '/admin/enter-issue-date',
    handler: (request, h) => {
      const year = request.payload['timestamp-year']
      const month = request.payload['timestamp-month']
      const day = request.payload['timestamp-day']

      // formats the date as iso and removes the timezone from the date
      const timestamp =
        year && day && month
          ? formatISO(new Date(year, month - 1, day)).split('+')[0] + '.000Z'
          : undefined
      setYarValue(request, 'timestamp', timestamp)
      return h.redirect('/admin/enter-certificate-status')
    }
  }
]
