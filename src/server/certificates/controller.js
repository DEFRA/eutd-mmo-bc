import {
  getCertificateDetails,
  uploadCertificateDetails,
  removeDocument
} from '../common/helpers/certificates.js'

/**
 * A certificates check endpoint. Used by the platform to check if the provided certificates exists.
 * @satisfies {Partial<ServerRoute>}
 */
export const certificatesController = {
  async handler(request, h) {
    const { certNumber } = request.query

    if (
      certNumber === undefined ||
      certNumber === '' ||
      certNumber === 'GBR-2018-CC-123A4BC56'
    ) {
      return h.view('result/index')
    }

    const resultModel = await getCertificateDetails(certNumber.trim())
    return h.view('result/index', resultModel)
  }
}

export const updateCertificateDetails = {
  async handler(request) {
    const { certificateNumber } = request.params
    const payload = request.payload
    const resultModel = await uploadCertificateDetails(
      certificateNumber,
      payload
    )
    return `Certificate Data for ${JSON.stringify(resultModel)}`
  }
}

export const removeCertificateDetails = {
  async handler(request) {
    const { certificateNumber } = request.params
    const resultModel = await removeDocument(certificateNumber)
    return `Certificate Data for ${JSON.stringify(resultModel)}`
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
