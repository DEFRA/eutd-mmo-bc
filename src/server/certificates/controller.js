import {
  getCertificateDetails,
  uploadCertificateDetails,
  removeDocument,
  getList
} from '../common/helpers/certificates.js'
import { bulkUploadCertificateDetails } from '../common/helpers/bulk-upload.js'

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

    const resultModel = await getCertificateDetails(request, certNumber.trim())
    return h.view('result/index', {
      ...resultModel,
      loggedIn: request.auth.isAuthenticated
    })
  }
}

export const validateCertificate = {
  async handler(request) {
    const { certificateNumber } = request.params

    if (
      certificateNumber === undefined ||
      certificateNumber === '' ||
      certificateNumber === 'GBR-2018-CC-123A4BC56'
    ) {
      return 'The certificate number entered is not valid'
    }

    const resultModel = await getCertificateDetails(
      request,
      certificateNumber.trim()
    )
    return {
      ...resultModel,
      loggedIn: request.auth.isAuthenticated
    }
  }
}

export const getCertificates = {
  async handler(request) {
    return await getList(request)
  }
}

export const updateCertificateDetails = {
  async handler(request, h) {
    const payload = request.payload
    const result = await uploadCertificateDetails(request, payload, true)
    if (result.error) {
      return h
        .response(
          `Error updating certificate ${request.params.certificateNumber} ${result.error}`
        )
        .code(400)
    } else {
      return h.response(`Success`)
    }
  }
}

export const updateCertificatesDetails = {
  async handler(request, h) {
    const payload = request.payload
    try {
      await bulkUploadCertificateDetails(request, payload)
      return h.response(`Success`)
    } catch (e) {
      const errorCode500 = 500
      return h
        .response(
          `
          Error bulk updating certificate ${e}`
        )
        .code(errorCode500)
    }
  }
}

export const removeCertificateDetails = {
  async handler(request, h) {
    const { certificateNumber } = request.params
    const result = await removeDocument(request, certificateNumber)
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
