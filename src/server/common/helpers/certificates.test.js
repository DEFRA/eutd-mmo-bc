import {
  getList,
  getCertificateDetails,
  uploadCertificateDetails,
  removeDocument
} from '~/src/server/common/helpers/certificates.js'
import * as S3Helpers from '~/src/server/common/helpers/repository/S3Bucket.js'
import {
  CERTNUMBER_TIMESTAMP_MISSING,
  CERTIFICATE_TO_VOID_NOT_FOUND,
  CERTIFICATE_NOT_FROM_ADMIN_APP,
  CERTIFICATE_TO_VOID_NOT_COMPLETE
} from '~/src/server/common/helpers/error-constants.js'

describe('#certificates - download', () => {
  const certifiateJson = [
    {
      certNumber: 'GBR-2024-CC-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW03',
      status: 'COMPLETE',
      timestamp: '2024-07-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '2024-05-06T00:00:00.000Z',
      status: 'VOID'
    }
  ]

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('Should call the S3 download function', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getList(request)
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual(certifiateJson)
  })

  test('Should get a specific certificate from the S3 bucket', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getCertificateDetails(
      request,
      'GBR-2024-CC-123A4AW02'
    )
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual({
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '06 May 2024',
      status: 'VOID',
      isValid: false
    })
  })

  test('Should get a specific certificate from the S3 bucket and set timestamp as undefined if not present', async () => {
    const request = {
      s3: jest.fn()
    }
    const certifiateJson = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'COMPLETE',
        timestamp: '2024-07-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW02',
        status: 'VOID'
      }
    ]
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getCertificateDetails(
      request,
      'GBR-2024-CC-123A4AW02'
    )
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual({
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: undefined,
      status: 'VOID',
      isValid: false
    })
  })

  test('Should get a specific certificate from the S3 bucket and set isValid as false if no status', async () => {
    const request = {
      s3: jest.fn()
    }
    const certifiateJson = [
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'COMPLETE',
        timestamp: '2024-07-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW02',
        timestamp: '2024-07-06T00:00:00.000Z'
      }
    ]
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getCertificateDetails(
      request,
      'GBR-2024-CC-123A4AW02'
    )
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual({
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '06 July 2024',
      status: undefined,
      isValid: false
    })
  })

  test('Should get a valid certificate from the S3 bucket', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getCertificateDetails(
      request,
      'GBR-2024-CC-123A4AW06'
    )
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual({
      certNumber: 'GBR-2024-CC-123A4AW06',
      timestamp: '06 May 2024',
      status: 'COMPLETE',
      isValid: true
    })
  })

  test('Should return the certnumber if it is not in the list', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    const response = await getCertificateDetails(
      request,
      'GBR-2024-CC-123A4AW89'
    )
    expect(S3Helpers.download.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(response).toStrictEqual({
      certNumber: 'GBR-2024-CC-123A4AW89',
      isValid: false
    })
  })
})

describe('#certificates - upload', () => {
  const certifiateJson = [
    {
      certNumber: 'GBR-2024-CM-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CM-123A4AW03',
      status: 'DRAFT',
      timestamp: '2024-07-06T00:00:00.000Z'
    }
  ]

  const updatedCertifiateJson = [
    {
      certNumber: 'GBR-2024-CM-123A4AW02',
      timestamp: '2024-05-06T00:00:00.000Z',
      status: 'COMPLETE'
    },
    {
      certNumber: 'GBR-2024-CM-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CM-123A4AW03',
      status: 'DRAFT',
      timestamp: '2024-07-06T00:00:00.000Z'
    }
  ]

  const newCertificate = {
    certNumber: 'GBR-2024-CM-123A4AW02',
    timestamp: '2024-05-06T00:00:00.000Z',
    status: 'COMPLETE'
  }

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('Should upload a new certificate', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    await uploadCertificateDetails(request, newCertificate)
    expect(S3Helpers.upload.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(S3Helpers.upload.mock.calls[0][2]).toStrictEqual(
      JSON.stringify(updatedCertifiateJson)
    )
  })

  test('Should not include a certificate if the certNumber is already present', async () => {
    const request = {
      s3: jest.fn()
    }
    const newCertificate = {
      certNumber: 'GBR-2024-CM-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    await uploadCertificateDetails(request, newCertificate)
    expect(S3Helpers.upload.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(S3Helpers.upload.mock.calls[0][2]).toStrictEqual(
      JSON.stringify(certifiateJson)
    )
  })

  test('Should return false if there was no timestamp', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await uploadCertificateDetails(request, {
      certNumber: 'GBR-2024-CM-123A4AW06',
      status: 'COMPLETE'
    })
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toStrictEqual({
      error: CERTNUMBER_TIMESTAMP_MISSING
    })
  })

  test('Should return false if there was no certNumber', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await uploadCertificateDetails(request, {
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    })
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toStrictEqual({
      error: CERTNUMBER_TIMESTAMP_MISSING
    })
  })

  test('Should return an error when trying to void a certificate that does not exist', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await uploadCertificateDetails(request, {
      certNumber: 'GBR-2024-CM-123A4TR04',
      status: 'VOID',
      timestamp: '2024-05-06T00:00:00.000Z'
    })
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toStrictEqual({
      error: CERTIFICATE_TO_VOID_NOT_FOUND
    })
  })

  test('Should return an error when trying to void a certificate that is in DRAFT', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await uploadCertificateDetails(request, {
      certNumber: 'GBR-2024-CM-123A4AW03',
      status: 'VOID',
      timestamp: '2024-05-06T00:00:00.000Z'
    })
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toStrictEqual({
      error: CERTIFICATE_TO_VOID_NOT_COMPLETE
    })
  })

  test('Should return an error if the certificate number is not correct', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await uploadCertificateDetails(request, {
      certNumber: 'GBR-2024-CC-123A4TR04',
      status: 'VOID',
      timestamp: '2024-05-06T00:00:00.000Z'
    })
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toStrictEqual({
      error: CERTIFICATE_NOT_FROM_ADMIN_APP
    })
  })

  test('Should VOID a certificate', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    await uploadCertificateDetails(request, {
      certNumber: 'GBR-2024-CM-123A4AW06',
      status: 'VOID',
      timestamp: '2024-05-06T00:00:00.000Z'
    })
    expect(S3Helpers.upload.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(S3Helpers.upload.mock.calls[0][2]).toStrictEqual(
      JSON.stringify([
        {
          certNumber: 'GBR-2024-CM-123A4AW06',
          status: 'VOID',
          timestamp: '2024-05-06T00:00:00.000Z'
        },
        {
          certNumber: 'GBR-2024-CM-123A4AW03',
          status: 'DRAFT',
          timestamp: '2024-07-06T00:00:00.000Z'
        }
      ])
    )
  })
})

describe('#certificates - remove', () => {
  const certifiateJson = [
    {
      certNumber: 'GBR-2024-CC-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW03',
      status: 'COMPLETE',
      timestamp: '2024-07-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '2024-05-06T00:00:00.000Z',
      status: 'COMPLETE'
    }
  ]

  const updatedCertificates = [
    {
      certNumber: 'GBR-2024-CC-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '2024-05-06T00:00:00.000Z',
      status: 'COMPLETE'
    }
  ]

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('Should remove a certificate from the list then call upload', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    await removeDocument(request, 'GBR-2024-CC-123A4AW03')
    expect(S3Helpers.upload.mock.calls[0][1]).toBe('ecert_certificates.json')
    expect(S3Helpers.upload.mock.calls[0][2]).toStrictEqual(
      JSON.stringify(updatedCertificates)
    )
  })

  test('Should return false if there was no certificate number', async () => {
    const request = {
      s3: jest.fn()
    }
    jest.spyOn(S3Helpers, 'download').mockResolvedValue(certifiateJson)
    jest.spyOn(S3Helpers, 'upload').mockResolvedValue(true)
    const response = await removeDocument(request, '')
    expect(S3Helpers.upload).not.toHaveBeenCalled()
    expect(response).toBeFalsy()
  })
})
