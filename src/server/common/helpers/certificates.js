import { format } from 'date-fns'
import {
  download,
  upload
} from '~/src/server/common/helpers/repository/S3Bucket.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const BUCKET_FILENAME = 'ecert_certificates.json'
const STATUS_COMPLETE = 'COMPLETE'

export const getCertificateDetails = async (certNumber) => {
  const list = await getList()
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

export const getList = async () => {
  return await download(BUCKET_FILENAME)
}

export const uploadCertificateDetails = async (newCertificate) => {
  const logger = createLogger()
  const list = await getList()

  if (!newCertificate.certNumber || !newCertificate.timestamp) {
    logger.error('"certNumber" and "timestamp" are required for upload')
    return false
  }

  // removes the timezone from the date
  newCertificate.timestamp = newCertificate.timestamp.split('+')[0] + '.000Z'

  const newCertificatelist = [
    newCertificate,
    ...list.filter((entry) => entry.certNumber !== newCertificate.certNumber)
  ]

  return await upload(BUCKET_FILENAME, JSON.stringify(newCertificatelist))
}

export const removeDocument = async (certificateNumber) => {
  const logger = createLogger()
  const list = await getList()

  if (!certificateNumber) {
    logger.error('"certNumber" is required for upload')
    return false
  }

  const filteredList = list.filter(
    (entry) => entry.certNumber !== certificateNumber
  )

  return await upload(BUCKET_FILENAME, JSON.stringify(filteredList))
}
