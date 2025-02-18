import { uploadCertificateDetails } from './certificates.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

export const bulkUploadCertificateDetails = async (
  request,
  certificateList
) => {
  const logger = createLogger()

  for (const newCertificate of certificateList) {
    logger.info(`
      updating ${newCertificate.certNumber} with ${newCertificate.status} status`)

    if (newCertificate.status === 'VOID') {
      logger.info(`adding COMPLETE entry for ${newCertificate.certNumber}`)

      const completeCertificate = {
        ...newCertificate,
        status: 'COMPLETE'
      }
      const result = await uploadCertificateDetails(
        request,
        completeCertificate,
        true
      )
      if (result.error) {
        logger.error(`Error: ${newCertificate.certNumber} ${result.error}`)
        continue
      }
    }

    logger.info(`
      adding ${newCertificate.status} entry for ${newCertificate.certNumber}`)

    const result = await uploadCertificateDetails(request, newCertificate, true)
    if (result.error) {
      logger.error(`Error: ${newCertificate.certNumber} ${result.error}`)
    }
  }
}
