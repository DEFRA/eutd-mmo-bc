import { format } from 'date-fns'
import {
  download,
  upload
} from '~/src/server/common/helpers/repository/S3Bucket.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import {
  CERTNUMBER_TIMESTAMP_MISSING,
  CERTIFICATE_TO_VOID_NOT_FOUND,
  CERTIFICATE_NOT_FROM_ADMIN_APP,
  CERTIFICATE_TO_VOID_NOT_COMPLETE,
  CERTIFICATE_ALREADY_VOID
} from '~/src/server/common/helpers/error-constants.js'

const BUCKET_FILENAME = 'ecert_certificates.json'
const STATUS_COMPLETE = 'COMPLETE'

export const getCertificateDetails = async (request, certNumber) => {
  const list = await getList(request)
  const certificate = list.find((entry) => entry.certNumber === certNumber)

  if (certificate) {
    return {
      certNumber,
      timestamp: certificate.timestamp
        ? format(certificate.timestamp, 'dd MMMM yyyy')
        : undefined,
      status: certificate.status,
      isValid: certificate.status
        ? certificate.status.toUpperCase() === STATUS_COMPLETE
        : false
    }
  }

  return {
    certNumber,
    isValid: false
  }
}

export const getList = async (request) => {
  return await download(request.s3, BUCKET_FILENAME)
}

const checkCertificateNumber = (certNumber) => {
  const matches = /GBR-\d{4}-(CM|PM|SM)/g.exec(certNumber)
  return matches && matches.length > 0 ? true : null
}

export const uploadCertificateDetails = async (
  request,
  newCertificate,
  bypassRegex = false
) => {
  const logger = createLogger()
  const list = await getList(request)

  if (!newCertificate.certNumber || !newCertificate.timestamp) {
    logger.error('"certNumber" and "timestamp" are required for upload')
    return {
      error: CERTNUMBER_TIMESTAMP_MISSING
    }
  }

  let newCertificateList = []
  const isAdminCertificate = checkCertificateNumber(newCertificate.certNumber)

  if (isAdminCertificate === true || bypassRegex === true) {
    const existingCertificate = list.find(
      (certificates) => certificates.certNumber === newCertificate.certNumber
    )
    if (newCertificate.status === 'VOID') {
      if (!existingCertificate) {
        return {
          error: CERTIFICATE_TO_VOID_NOT_FOUND
        }
      }
      if (existingCertificate.status !== 'COMPLETE') {
        return {
          error: CERTIFICATE_TO_VOID_NOT_COMPLETE
        }
      }
    }
    if (
      existingCertificate?.status === 'VOID' &&
      newCertificate.status === 'COMPLETE'
    ) {
      return {
        error: CERTIFICATE_ALREADY_VOID
      }
    }
    newCertificateList = [
      newCertificate,
      ...list.filter((entry) => entry.certNumber !== newCertificate.certNumber)
    ]
  } else {
    logger.error(`certNumber: ${newCertificate.certNumber} is not valid`)
    return {
      error: CERTIFICATE_NOT_FROM_ADMIN_APP
    }
  }

  return await upload(
    request.s3,
    BUCKET_FILENAME,
    JSON.stringify(newCertificateList)
  )
}

export const removeDocument = async (request, certificateNumber) => {
  const logger = createLogger()
  const list = await getList(request)

  if (!certificateNumber) {
    logger.error('"certNumber" is required for removal')
    return false
  }

  const filteredList = list.filter(
    (entry) => entry.certNumber !== certificateNumber
  )

  return await upload(request.s3, BUCKET_FILENAME, JSON.stringify(filteredList))
}
