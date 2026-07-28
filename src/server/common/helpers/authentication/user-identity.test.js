import { describe, test, expect } from '@jest/globals'
import { getAdminUserIdentity } from '~/src/server/common/helpers/authentication/user-identity.js'

describe('getAdminUserIdentity', () => {
  const cookieName = 'test-auth-cookie'

  test('Should extract user identity from valid cookie', () => {
    const mockRequest = {
      state: {
        [cookieName]: {
          name: 'John Doe',
          sub: 'user-guid-123',
          ipaddr: '192.168.1.1',
          role: 'Admin',
          session: 'session-123'
        }
      },
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity).toEqual({
      userName: 'John Doe',
      id: 'user-guid-123',
      ipaddr: '192.168.1.1',
      role: 'Admin',
      session: 'session-123'
    })
  })

  test('Should use request IP when ipaddr not in cookie', () => {
    const mockRequest = {
      state: {
        [cookieName]: {
          name: 'John Doe',
          sub: 'user-guid-123',
          session: 'session-123'
        }
      },
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity.ipaddr).toBe('10.0.0.1')
  })

  test('Should handle missing cookie with fallback values', () => {
    const mockRequest = {
      state: {},
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity).toEqual({
      userName: 'Anonymous',
      id: 'anonymous',
      ipaddr: '10.0.0.1',
      session: 'no-session'
    })
  })

  test('Should handle undefined role gracefully', () => {
    const mockRequest = {
      state: {
        [cookieName]: {
          name: 'John Doe',
          sub: 'user-guid-123',
          ipaddr: '192.168.1.1',
          session: 'session-123'
          // role is undefined
        }
      },
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity.role).toBeUndefined()
  })

  test('Should handle missing session with fallback', () => {
    const mockRequest = {
      state: {
        [cookieName]: {
          name: 'John Doe',
          sub: 'user-guid-123'
        }
      },
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity.session).toBe('no-session')
  })

  test('Should handle malformed cookie state', () => {
    const mockRequest = {
      state: {
        [cookieName]: null
      },
      info: {
        remoteAddress: '10.0.0.1'
      }
    }

    const identity = getAdminUserIdentity(mockRequest, cookieName)

    expect(identity).toEqual({
      userName: 'Anonymous',
      id: 'anonymous',
      ipaddr: '10.0.0.1',
      session: 'no-session'
    })
  })
})
