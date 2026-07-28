/**
 * Extract admin user identity from authenticated request
 * @param {import('@hapi/hapi').Request} request - Hapi request object
 * @param {string} cookieName - Name of the authentication cookie
 * @returns {{userName: string, id: string, ipaddr: string, role?: string, session: string}}
 */
export function getAdminUserIdentity(request, cookieName) {
  const cookieState = request.state[cookieName]

  if (!cookieState) {
    // Return anonymous identity for unauthenticated requests
    return {
      userName: 'Anonymous',
      id: 'anonymous',
      ipaddr: request.info.remoteAddress,
      session: 'no-session'
    }
  }

  return {
    userName: cookieState.name || 'Unknown',
    id: cookieState.sub || 'unknown-id',
    ipaddr: cookieState.ipaddr || request.info.remoteAddress,
    role: cookieState.role,
    session: cookieState.session || 'no-session'
  }
}

/**
 * @import { Request } from '@hapi/hapi'
 */
