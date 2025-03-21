import { createServer } from '~/src/server/index.js'
import * as Certificates from '~/src/server/common/helpers/certificates.js'
import * as BulkUpload from '~/src/server/common/helpers/bulk-upload.js'
import { config } from '~/src/config/index.js'
import { CERTIFICATE_NOT_FROM_ADMIN_APP } from '~/src/server/common/helpers/error-constants.js'

describe('#certificatesController', () => {
  /** @type {Server} */
  let server
  let mockGetCertificate
  const result = {
    certNumber: 'GBR-2024-CC-123A4BC56',
    timestamp: '12 MAY 2024',
    status: 'COMPLETE',
    isValid: true
  }

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    mockGetCertificate = jest.spyOn(Certificates, 'getCertificateDetails')
    mockGetCertificate.mockResolvedValue(result)
  })

  afterEach(async () => {
    await server.stop()
    mockGetCertificate.mockRestore()
  })

  test('Should render the results page with cert number GBR-2018-CC-123A4BC56', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber=GBR-2018-CC-123A4BC56'
    })

    expect(payload).toContain('The certificate number entered is not valid')
    expect(statusCode).toBe(200)
  })

  test('Should render the results page with empty cert number', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber='
    })

    expect(payload).toContain('The certificate number entered is not valid')
    expect(statusCode).toBe(200)
  })

  test('Should render the results page with undefined cert number', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates'
    })

    expect(payload).toContain('The certificate number entered is not valid')
    expect(statusCode).toBe(200)
  })

  test('Should get details for a given certificate', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber=GBR-2024-CC-123A4BC56'
    })

    expect(mockGetCertificate.mock.calls[0][1]).toBe('GBR-2024-CC-123A4BC56')
    expect(payload).toContain('Validation confirmed')
    expect(statusCode).toBe(200)
  })

  test('Should get details for a given certificate with spaces', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber= GBR-2024-CC-123A4BC56 '
    })

    expect(mockGetCertificate.mock.calls[0][1]).toBe('GBR-2024-CC-123A4BC56')
    expect(payload).toContain('Validation confirmed')
    expect(statusCode).toBe(200)
  })

  test('Should return a 400 error', async () => {
    const error = new Error('Something has gone wrong')
    mockGetCertificate.mockImplementation(() => {
      throw error
    })
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber=GBR-2024-CC-123A4BC56'
    })

    expect(mockGetCertificate.mock.calls[0][1]).toBe('GBR-2024-CC-123A4BC56')
    expect(statusCode).toBe(500)
  })
})

describe(`API call for '/certificates/{certificateNumber} swagger endpoint`, () => {
  /** @type {Server} */
  let server
  let mockGetCertificate
  const result = {
    certNumber: 'GBR-2024-CC-123A4BC56',
    timestamp: '12 MAY 2024',
    status: 'COMPLETE',
    isValid: true,
    loggedIn: false
  }

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    mockGetCertificate = jest.spyOn(Certificates, 'getCertificateDetails')
    mockGetCertificate.mockResolvedValue(result)
  })

  afterEach(async () => {
    await server.stop()
    mockGetCertificate.mockRestore()
  })

  test('Should validate with certificate number GBR-2018-CC-123A4BC56', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates/GBR-2018-CC-123A4BC56'
    })

    expect(payload).toContain('The certificate number entered is not valid')
    expect(statusCode).toBe(200)
  })

  test('Should validate a given certificate', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates/GBR-2024-CC-123A4BC56'
    })

    expect(mockGetCertificate.mock.calls[0][1]).toBe('GBR-2024-CC-123A4BC56')
    expect(JSON.parse(payload)).toEqual(result)
    expect(statusCode).toBe(200)
  })

  test('Should return a 500 error', async () => {
    const error = new Error('Something has gone wrong')
    mockGetCertificate.mockImplementation(() => {
      throw error
    })
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/certificates/GBR-2024-CC-123A4BC56'
    })

    expect(mockGetCertificate.mock.calls[0][1]).toBe('GBR-2024-CC-123A4BC56')
    expect(statusCode).toBe(500)
  })
})

describe('API calls for GET/PUT/DELETE', () => {
  /** @type {Server} */
  let server
  let mockGetCertificate, mockPutCertificate
  let mockDeleteCertificate, mockBulkUploadCertificate
  const apiHeaderKey = config.get('apiAuth')
  const result = [
    {
      certNumber: 'GBR-2024-CC-123A4BC56',
      timestamp: '12 MAY 2024',
      status: 'COMPLETE',
      isValid: true
    }
  ]

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    mockGetCertificate = jest.spyOn(Certificates, 'getList')
    mockPutCertificate = jest.spyOn(Certificates, 'uploadCertificateDetails')
    mockDeleteCertificate = jest.spyOn(Certificates, 'removeDocument')
    mockGetCertificate.mockResolvedValue(result)
    mockBulkUploadCertificate = jest.spyOn(
      BulkUpload,
      'bulkUploadCertificateDetails'
    )
  })

  afterEach(async () => {
    await server.stop()
    mockGetCertificate.mockRestore()
    mockPutCertificate.mockRestore()
    mockBulkUploadCertificate.mockRestore()
  })

  test('Should call the api certficates api successfully', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates'
    })

    expect(statusCode).toBe(200)
  })

  test('Should call the api certficates api and return data', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates'
    })
    expect(JSON.parse(payload)).toEqual(result)
    expect(statusCode).toBe(200)
  })

  test('Should update the certificates successfully', async () => {
    mockPutCertificate.mockResolvedValue(true)
    const { statusCode, payload } = await server.inject({
      method: 'PUT',
      headers: {
        'x-api-key': apiHeaderKey
      },
      payload: {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'COMPLETE',
        timestamp: '2024-07-06T00:00:00.000Z'
      },
      url: '/api/certificates/certificateNumber'
    })
    expect(payload).toContain('Success')
    expect(statusCode).toBe(200)
  })

  test('Should bulk update the certificates successfully', async () => {
    mockBulkUploadCertificate.mockResolvedValue(undefined)
    const { statusCode, payload } = await server.inject({
      method: 'PUT',
      headers: {
        'x-api-key': apiHeaderKey
      },
      payload: [
        {
          certNumber: 'GBR-2024-CC-123A4AW03',
          status: 'COMPLETE',
          timestamp: '2024-07-06T00:00:00.000Z'
        }
      ],
      url: '/api/certificates'
    })
    expect(payload).toContain('Success')
    expect(statusCode).toBe(200)
  })

  test('Should bulk update the certificates unsuccessfully', async () => {
    mockBulkUploadCertificate.mockRejectedValue(
      new Error('something has gone wrong')
    )
    const { statusCode, payload } = await server.inject({
      method: 'PUT',
      headers: {
        'x-api-key': apiHeaderKey
      },
      payload: [
        {
          certNumber: 'GBR-2024-CC-123A4AW03',
          status: 'COMPLETE',
          timestamp: '2024-07-06T00:00:00.000Z'
        }
      ],
      url: '/api/certificates'
    })
    expect(payload).toContain(
      'Error bulk updating certificate Error: something has gone wrong'
    )
    expect(statusCode).toBe(500)
  })

  test('Should delete the certificate details successfully', async () => {
    mockDeleteCertificate.mockResolvedValue(true)
    const { statusCode, payload } = await server.inject({
      method: 'DELETE',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates/certificateNumber'
    })
    expect(payload).toContain('Success')
    expect(statusCode).toBe(200)
  })

  test('Should throw error when updating the certificate', async () => {
    mockPutCertificate.mockResolvedValue({
      error: CERTIFICATE_NOT_FROM_ADMIN_APP
    })
    const { statusCode } = await server.inject({
      method: 'PUT',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates/certificateNumber',
      payload: {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'COMPLETE',
        timestamp: '2024-07-06T00:00:00.000Z'
      }
    })
    expect(statusCode).toBe(400)
  })

  test('Should throw error when removing the certificate', async () => {
    mockDeleteCertificate.mockResolvedValue(false)
    const { statusCode } = await server.inject({
      method: 'DELETE',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates/certificateNumber'
    })
    expect(statusCode).toBe(400)
  })

  test('Should throw 500 error when updating the certificate', async () => {
    mockPutCertificate.mockRejectedValue(Error('my error'))
    const { statusCode } = await server.inject({
      method: 'PUT',
      headers: {
        'x-api-key': apiHeaderKey
      },
      payload: {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'COMPLETE',
        timestamp: '2024-07-06T00:00:00.000Z'
      },
      url: '/api/certificates/certificateNumber'
    })
    expect(statusCode).toBe(500)
  })

  test('Should throw 500 error when removing the certificate', async () => {
    mockDeleteCertificate.mockRejectedValue(Error('my error'))
    const { statusCode } = await server.inject({
      method: 'DELETE',
      headers: {
        'x-api-key': apiHeaderKey
      },
      url: '/api/certificates/certificateNumber'
    })
    expect(statusCode).toBe(500)
  })

  test('Should throw error if there is no api key', async () => {
    mockPutCertificate.mockResolvedValue(true)
    const { statusCode } = await server.inject({
      method: 'PUT',
      headers: {},
      url: '/api/certificates/certificateNumber'
    })
    expect(statusCode).toBe(401)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
