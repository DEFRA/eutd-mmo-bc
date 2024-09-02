import { getYarValue } from '~/src/server/common/helpers/yar-helper.js'
import {
  CERTIFICATE_TO_VOID_NOT_FOUND,
  CERTIFICATE_NOT_FROM_ADMIN_APP,
  CERTIFICATE_TO_VOID_NOT_COMPLETE
} from '~/src/server/common/helpers/error-constants.js'
/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const checkCertificateDetailsController = {
  handler(request, h) {
    return h.view(
      'admin/checkCertificateDetails/index',
      getCheckCertificateDetailsModel(request)
    )
  }
}

export const getCheckCertificateDetailsModel = (request, error) => {
  let errorMessage = ''
  switch (error) {
    case CERTIFICATE_TO_VOID_NOT_FOUND:
      errorMessage = 'The certificate you are trying to void does not exist'
      break
    case CERTIFICATE_NOT_FROM_ADMIN_APP:
      if (request.payload.status === 'VOID') {
        errorMessage =
          'The certificate you are trying to void was not created from the internal admin app'
      } else {
        errorMessage = 'Certificate cannot be completed'
      }
      break
    case CERTIFICATE_TO_VOID_NOT_COMPLETE:
      errorMessage = 'Only completed certificates can be voided'
      break
    default:
      break
  }
  return {
    pageTitle: 'GOV.UK - Check an Export Certificate',
    heading: 'Check the details',
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
    timestamp: getYarValue(request, 'timestamp'),
    status: getYarValue(request, 'status'),
    errorMessage
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
