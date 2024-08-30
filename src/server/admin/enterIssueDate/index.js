import { enterIssueDateController } from '~/src/server/admin/enterIssueDate/controller.js'
import { formatISO, isFuture, isValid, parse } from 'date-fns'
import { enGB } from 'date-fns/locale'
import {
  getYarValue,
  setYarValue
} from '~/src/server/common/helpers/yar-helper.js'

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
          ? formatISO(new Date(year, month - 1, day)).split('T')[0] +
            'T00:00:00.000Z'
          : undefined
      setYarValue(request, 'timestamp', timestamp)

      const issueDateInFuture = isFuture(new Date(year, month, day))
      const parsedDate = parse(`${day}/${month}/${year}`, 'P', new Date(), {
        locale: enGB
      })
      const issueDateIsValid = isValid(parsedDate)
      if (issueDateInFuture || !issueDateIsValid) {
        const badRequestStatusCode = 400
        return h
          .view('admin/enterIssueDate/index', {
            pageTitle: 'Error: GOV.UK - Check an Export Certificate',
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
            timestampDay: day,
            timestampMonth: month,
            timestampYear: year,
            status: getYarValue(request, 'status'),
            errorMessage: issueDateInFuture
              ? 'Incorrect date. Enter a valid date to proceed'
              : 'Date cannot be blank. Enter a valid date to proceed'
          })
          .code(badRequestStatusCode)
      }
      return h.redirect('/admin/enter-certificate-status')
    }
  }
]
