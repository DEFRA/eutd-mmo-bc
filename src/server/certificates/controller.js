import { isEmpty } from 'lodash'
import { get } from '../common/helpers/certificates.js'

/**
 * A certificates check endpoint. Used by the platform to check if the provided certificates exists.
 * @satisfies {Partial<ServerRoute>}
 */
export const certificatesController = {
  handler(request, h) {
    const certNumber = request.query.certNumber

    if (isEmpty(certNumber) || certNumber === 'GBR-2018-CC-123A4BC56') {
      return h.view('result/index')
    }

    const resultModel = get(certNumber)
    return h.view('result/index', resultModel)
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
