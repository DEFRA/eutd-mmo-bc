import { createServer } from '~/src/server/index.js'
import * as certificatesHelper from '~/src/server/common/helpers/certificates.js'
import * as yarHelpers from '~/src/server/common/helpers/yar-helper.js'

describe('#checkCertificateDetailsController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
    jest.restoreAllMocks()
  })

  test('Should load the check-certificate-details page with values present in yar', async () => {
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW15')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('COMPLETE')
    const { payload } = await server.inject({
      method: 'GET',
      url: '/admin/check-certificate-details',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      }
    })

    expect(payload).toContain('Check the details')
    expect(payload).toContain('Now save the Certificate')
    expect(payload).toContain('Accept and send')
    expect(payload).toContain('2024-05-02T00:00:00.000Z')
    expect(payload).toContain('GBR-2018-CC-123A4AW15')
    expect(payload).toContain('COMPLETE')
  })

  test('Should upload certificate and redirect on POST', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockReturnValueOnce(true)
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/check-certificate-details',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: 'GBR-2018-CC-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'DRAFT'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CC-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'DRAFT'
    })
    expect(statusCode).toBe(302)
  })

  test('Should not upload certificate and redirect', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockReturnValueOnce(false)
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/admin/check-certificate-details',
      auth: {
        strategy: 'session-auth',
        credentials: {
          username: 'test',
          password: 'test'
        }
      },
      payload: {
        certNumber: 'GBR-2018-CC-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'DRAFT'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CC-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'DRAFT'
    })
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
