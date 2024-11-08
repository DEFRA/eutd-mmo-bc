/**
 * @param {number} statusCode
 */
function statusCodeMessage(statusCode) {
  switch (true) {
    case statusCode === 404:
      return 'Page not found'
    case statusCode === 403:
      return 'Forbidden'
    case statusCode === 401:
      return 'Unauthorized'
    case statusCode === 400:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

/**
 * @param {Request} request
 * @param {ResponseToolkit} h
 */
export function catchAll(request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return response.header(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline'; img-src 'self'"
    )
  }

  request.logger.error(response?.stack)

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode)

  if (request.path?.startsWith('/api')) {
    // Return JSON response for API calls
    return h
      .response({
        statusCode: response.output.statusCode,
        error: response.output.payload.error,
        message: response.message
      })
      .code(response.output.statusCode)
      .type('application/json')
  } else {
    return h
      .view('error/index', {
        pageTitle: errorMessage,
        heading: statusCode,
        message: errorMessage
      })
      .code(statusCode)
  }
}

/**
 * @import { Request, ResponseToolkit } from '@hapi/hapi'
 */
