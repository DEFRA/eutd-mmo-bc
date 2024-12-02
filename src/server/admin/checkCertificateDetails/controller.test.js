import { createServer } from '~/src/server/index.js'
import * as certificatesHelper from '~/src/server/common/helpers/certificates.js'
import * as yarHelpers from '~/src/server/common/helpers/yar-helper.js'
import {
  CERTIFICATE_TO_VOID_NOT_FOUND,
  CERTIFICATE_NOT_FROM_ADMIN_APP,
  CERTIFICATE_TO_VOID_NOT_COMPLETE,
  CERTIFICATE_ALREADY_VOID
} from '~/src/server/common/helpers/error-constants.js'

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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'COMPLETE'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CM-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'COMPLETE'
    })
    expect(statusCode).toBe(302)
  })

  test('Should display error message for trying to void a certificate which does not exist', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockResolvedValueOnce({
        error: CERTIFICATE_TO_VOID_NOT_FOUND
      })
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CM-123A4AW22')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('VOID')
    const { statusCode, payload } = await server.inject({
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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'VOID'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CM-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'VOID'
    })
    expect(statusCode).toBe(400)
    expect(payload).toContain(
      'The certificate you are trying to void does not exist'
    )
  })

  test('Should display error message for trying to void a certificate which is not from the internal admin app', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockResolvedValueOnce({
        error: CERTIFICATE_NOT_FROM_ADMIN_APP
      })
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW22')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('VOID')
    const { statusCode, payload } = await server.inject({
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
        status: 'VOID'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CC-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'VOID'
    })
    expect(statusCode).toBe(400)
    expect(payload).toContain(
      'The certificate you are trying to void was not created from the internal admin app'
    )
  })

  test('Should display error message for trying to void a certificate which is not complete', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockResolvedValueOnce({
        error: CERTIFICATE_TO_VOID_NOT_COMPLETE
      })
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CM-123A4AW22')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('VOID')
    const { statusCode, payload } = await server.inject({
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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'VOID'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CM-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'VOID'
    })
    expect(statusCode).toBe(400)
    expect(payload).toContain('Only completed certificates can be voided')
  })

  test('Should display error message for trying to complete a void certificate', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockResolvedValueOnce({
        error: CERTIFICATE_ALREADY_VOID
      })
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CM-123A4AW22')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('VOID')
    const { statusCode, payload } = await server.inject({
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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'COMPLETE'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CM-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'COMPLETE'
    })
    expect(statusCode).toBe(400)
    expect(payload).toContain(
      'This certificate has already been Void, it cannot be marked as completed'
    )
  })

  test('Should display error message for trying to complete a certificate which is not from the internal admin app', async () => {
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockResolvedValueOnce({
        error: CERTIFICATE_NOT_FROM_ADMIN_APP
      })
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW22')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('COMPLETE')
    const { statusCode, payload } = await server.inject({
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
        status: 'COMPLETE'
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CC-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'COMPLETE'
    })
    expect(statusCode).toBe(400)
    expect(payload).toContain('Certificate cannot be completed')
  })
})

describe('checkCertificateDetailsController crumb', () => {
  let server
  const originalEnv = process.env

  beforeAll(async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production'
    }
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  test('Should return a 403 with no crumb present', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'COMPLETE'
      }
    })

    expect(statusCode).toBe(403)
  })

  test('Should return a 302 with crumb present', async () => {
    jest.spyOn(yarHelpers, 'setYarValue')
    jest
      .spyOn(yarHelpers, 'getYarValue')
      .mockReturnValueOnce('GBR-2018-CC-123A4AW15')
      .mockReturnValueOnce('2024-05-02T00:00:00.000Z')
      .mockReturnValueOnce('COMPLETE')
    const uploadSpy = jest
      .spyOn(certificatesHelper, 'uploadCertificateDetails')
      .mockReturnValueOnce(true)
    // needed to get the crumb token from the server
    const res = await server.inject({
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

    const crumb = res.headers['set-cookie'][0]
      .match(/crumb=([\w",;\\-]*);\s/)[1]
      .trim()

    jest.spyOn(yarHelpers, 'setYarValue')
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
        certNumber: 'GBR-2018-CM-123A4AW22',
        timestamp: '2024-05-02T00:00:00.000Z',
        status: 'COMPLETE',
        crumb
      },
      headers: {
        cookie: 'crumb=' + crumb
      }
    })

    expect(uploadSpy.mock.calls[0][1]).toStrictEqual({
      certNumber: 'GBR-2018-CM-123A4AW22',
      timestamp: '2024-05-02T00:00:00.000Z',
      status: 'COMPLETE'
    })
    expect(statusCode).toBe(302)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
