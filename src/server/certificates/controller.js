import {
  getCertificateDetails,
  uploadCertificateDetails,
  removeDocument,
  getList
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

export const getCertificates = {
  async handler() {
    return await getList()
  }
}

export const updateCertificateDetails = {
  async handler(request, h) {
    const payload = request.payload
    const result = await uploadCertificateDetails(payload)
    if (!result) {
      return h
        .response(
          `Error updating certificate ${request.params.certificateNumber}`
        )
        .code(400)
    } else {
      return h.response(`Success`)
    }
  }
}

export const removeCertificateDetails = {
  async handler(request, h) {
    const { certificateNumber } = request.params
    const result = await removeDocument(certificateNumber)
    if (!result) {
      return h
        .response(`Error removing certificate ${certificateNumber}`)
        .code(400)
    } else {
      return h.response(`Success`)
    }
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
