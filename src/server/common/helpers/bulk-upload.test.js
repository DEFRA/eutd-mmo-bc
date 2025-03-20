import * as Certificate from '~/src/server/common/helpers/certificates.js'
import * as loggerFunc from '~/src/server/common/helpers/logging/logger.js'
import { bulkUploadCertificateDetails } from './bulk-upload.js'

describe('#certificates - bulk upload', () => {
  const request = {
    s3: jest.fn()
  }
  const errorMock = jest.fn()
  const infoMock = jest.fn()

  let mockUploadCertificateDetails

  beforeEach(() => {
    mockUploadCertificateDetails = jest.spyOn(
      Certificate,
      'uploadCertificateDetails'
    )
    mockUploadCertificateDetails.mockResolvedValue(true)
    jest.spyOn(loggerFunc, 'createLogger').mockReturnValue({
      error: errorMock,
      info: infoMock
    })
  })

  afterEach(() => {
    mockUploadCertificateDetails.mockRestore()
    errorMock.mockRestore()
    infoMock.mockRestore()
  })

  test('Should bulk upload with no errors', async () => {
    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(2)
  })

  test('Should bulk upload with a VOID', async () => {
    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(3)
  })

  test('Should bulk upload with a VOID error', async () => {
    mockUploadCertificateDetails.mockResolvedValueOnce({
      error: 'CERTIFICATE_TO_VOID_NOT_FOUND'
    })

    mockUploadCertificateDetails.mockResolvedValue(true)

    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(2)
  })

  test('Should bulk upload with a COMPLETE error', async () => {
    mockUploadCertificateDetails.mockResolvedValueOnce(true)
    mockUploadCertificateDetails.mockResolvedValue({
      error: 'CERTNUMBER_TIMESTAMP_MISSING'
    })

    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(4)
    expect(errorMock).toHaveBeenCalledWith(
      'Error: GBR-2024-CC-123A4AW06 CERTNUMBER_TIMESTAMP_MISSING'
    )
  })
})
