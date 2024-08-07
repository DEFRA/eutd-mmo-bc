import { createServer } from '~/src/server/index.js'
import * as Certificates from '~/src/server/common/helpers/certificates.js'

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
    mockGetCertificate.mockReturnValue(result)
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

  test('Should get details for a given certificate', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/certificates?certNumber=GBR-2024-CC-123A4BC56'
    })

    expect(mockGetCertificate).toHaveBeenCalledWith('GBR-2024-CC-123A4BC56')
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

    expect(mockGetCertificate).toHaveBeenCalledWith('GBR-2024-CC-123A4BC56')
    expect(statusCode).toBe(500)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
