import {
  getList,
  checkCertificateTimestamp
} from '~/src/server/common/helpers/certificates.js'
import { upload } from '~/src/server/common/helpers/repository/S3Bucket.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const BUCKET_FILENAME = 'ecert_certificates.json'

export const bulkUploadCertificateDetails = async (
  request,
  certificateList
) => {
  const logger = createLogger()
  logger.info(`bulk upload for ${certificateList.length} documents`)

  const list = await getList(request)

  let newCertificateList = [...list]

  for (const newCertificate of certificateList) {
    if (checkCertificateTimestamp(newCertificate)) {
      logger.error('"certNumber" and "timestamp" are required for upload')
      continue
    }

    if (newCertificate.status === 'VOID') {
      const completeCertificate = {
        ...newCertificate,
        status: 'COMPLETE'
      }

      const hasCompleteCertificate = newCertificateList.some(
        (certificate) =>
          certificate.certNumber === completeCertificate.certNumber &&
          certificate.status === completeCertificate.status
      )

      if (!hasCompleteCertificate) {
        logger.info(`adding COMPLETE entry for ${newCertificate.certNumber}`)
        newCertificateList = [completeCertificate, ...newCertificateList]
      }
    }

    const hasEntry = newCertificateList.some(
      (entry) =>
        entry.certNumber === newCertificate.certNumber &&
        entry.status === newCertificate.status
    )

    if (!hasEntry) {
      logger.info(
        `adding ${newCertificate.status} entry for ${newCertificate.certNumber}`
      )
      newCertificateList = [newCertificate, ...newCertificateList]
    }
  }

  return upload(request.s3, BUCKET_FILENAME, JSON.stringify(newCertificateList))
}
