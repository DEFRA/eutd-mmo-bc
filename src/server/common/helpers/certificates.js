import { format } from 'date-fns'
import { download } from '~/src/server/common/helpers/repository/S3Bucket.js'

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
