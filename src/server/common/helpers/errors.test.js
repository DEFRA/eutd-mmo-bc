import { catchAll } from '~/src/server/common/helpers/errors.js'

describe('#errors', () => {
  test('Should return a 404 error', () => {
    const request = {
      logger: {
        error: jest.fn()
      },
      response: {
        isBoom: true,
        output: {
          statusCode: 404
        }
      }
    }
    const handlerMock = {
      view: jest.fn().mockReturnValue({ code: jest.fn() })
    }
    catchAll(request, handlerMock)
    expect(handlerMock.view.mock.calls[0][1].message).toBe('Page not found')
  })

  test('Should return a 403 error', () => {
    const request = {
      logger: {
        error: jest.fn()
      },
      response: {
        isBoom: true,
        output: {
          statusCode: 403
        }
      }
    }
    const handlerMock = {
      view: jest.fn().mockReturnValue({ code: jest.fn() })
    }
    catchAll(request, handlerMock)
    expect(handlerMock.view.mock.calls[0][1].message).toBe('Forbidden')
  })

  test('Should return a 401 error', () => {
    const request = {
      logger: {
        error: jest.fn()
      },
      response: {
        isBoom: true,
        output: {
          statusCode: 401
        }
      }
    }
    const handlerMock = {
      view: jest.fn().mockReturnValue({ code: jest.fn() })
    }
    catchAll(request, handlerMock)
    expect(handlerMock.view.mock.calls[0][1].message).toBe('Unauthorized')
  })

  test('Should return a 400 error', () => {
    const request = {
      logger: {
        error: jest.fn()
      },
      response: {
        isBoom: true,
        output: {
          statusCode: 400
        }
      }
    }
    const handlerMock = {
      view: jest.fn().mockReturnValue({ code: jest.fn() })
    }
    catchAll(request, handlerMock)
    expect(handlerMock.view.mock.calls[0][1].message).toBe('Bad Request')
  })

  test('Should return a generic error', () => {
    const request = {
      logger: {
        error: jest.fn()
      },
      response: {
        isBoom: true,
        output: {
          statusCode: 500
        }
      }
    }
    const handlerMock = {
      view: jest.fn().mockReturnValue({ code: jest.fn() })
    }
    catchAll(request, handlerMock)
    expect(handlerMock.view.mock.calls[0][1].message).toBe(
      'Something went wrong'
    )
  })
})
