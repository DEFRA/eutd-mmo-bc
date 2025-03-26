import * as Certificate from '~/src/server/common/helpers/certificates.js'
import * as S3Bucket from '~/src/server/common/helpers/repository/S3Bucket.js'
import * as loggerFunc from '~/src/server/common/helpers/logging/logger.js'
import { bulkUploadCertificateDetails } from './bulk-upload.js'

describe('#certificates - bulk upload', () => {
  const request = {
    s3: {
      send: jest.fn().mockResolvedValue({
        data: { body: [] }
      })
    }
  }
  const errorMock = jest.fn()
  const infoMock = jest.fn()

  let mockGetList
  let mockUploadCertificateDetails

  beforeEach(() => {
    mockGetList = jest.spyOn(Certificate, 'getList')
    mockGetList.mockResolvedValue([])
    mockUploadCertificateDetails = jest.spyOn(S3Bucket, 'upload')
    mockUploadCertificateDetails.mockResolvedValue(true)
    jest.spyOn(loggerFunc, 'createLogger').mockReturnValue({
      error: errorMock,
      info: infoMock
    })
  })

  afterEach(() => {
    mockGetList.mockRestore()
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
    expect(mockGetList).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(1)
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

    const uploadedCertificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockGetList).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(1)
    expect(infoMock).toHaveBeenCalledWith(
      'adding COMPLETE entry for GBR-2024-CC-123A4AW07'
    )
    expect(mockUploadCertificateDetails).toHaveBeenCalledWith(
      expect.anything(),
      'ecert_certificates.json',
      JSON.stringify(uploadedCertificateList)
    )
  })

  test('Should not bulk upload with an existing COMPLETE document for a VOID', async () => {
    mockGetList.mockResolvedValue([
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ])

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

    const uploadedCertificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
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
    expect(mockGetList).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(1)
    expect(infoMock).not.toHaveBeenCalledWith(
      'adding COMPLETE entry for GBR-2024-CC-123A4AW07'
    )
    expect(mockUploadCertificateDetails).toHaveBeenCalledWith(
      expect.anything(),
      'ecert_certificates.json',
      JSON.stringify(uploadedCertificateList)
    )
  })

  test('Should not bulk upload with an existing COMPLETE document', async () => {
    mockGetList.mockResolvedValue([
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ])

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

    const uploadedCertificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'VOID',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW07',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)
    expect(mockGetList).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(1)
    expect(infoMock).not.toHaveBeenCalledWith(
      'adding COMPLETE entry for GBR-2024-CC-123A4AW06'
    )
    expect(mockUploadCertificateDetails).toHaveBeenCalledWith(
      expect.anything(),
      'ecert_certificates.json',
      JSON.stringify(uploadedCertificateList)
    )
  })

  test('Should not bulk upload with a VOID error', async () => {
    mockGetList.mockRejectedValue(new Error('something has gone wrong'))

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

    await expect(
      bulkUploadCertificateDetails(request, certificateList)
    ).rejects.toThrow('something has gone wrong')
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(0)
  })

  test('Should not bulk upload a document without a timestamp', async () => {
    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE'
      }
    ]

    await bulkUploadCertificateDetails(request, certificateList)

    expect(errorMock).toHaveBeenCalledWith(
      '"certNumber" and "timestamp" are required for upload'
    )
    expect(mockGetList).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledTimes(1)
    expect(mockUploadCertificateDetails).toHaveBeenCalledWith(
      expect.anything(),
      'ecert_certificates.json',
      JSON.stringify([])
    )
  })

  test('Should throw a bulk upload error', async () => {
    mockUploadCertificateDetails.mockRejectedValue(
      new Error('something has gone wrong')
    )
    const certificateList = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE'
      }
    ]

    await expect(
      bulkUploadCertificateDetails(request, certificateList)
    ).rejects.toThrow('something has gone wrong')
  })
})
