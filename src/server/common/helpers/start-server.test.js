import { startServer } from '~/src/server/common/helpers/start-server.js'
import * as serverHelper from '~/src/server/index.js'
import { config } from '~/src/config/index.js'
import * as loggerFunc from '~/src/server/common/helpers/logging/logger.js'

describe('#start-server', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should start the server', async () => {
    const server = {
      start: jest.fn().mockResolvedValue(true),
      logger: {
        info: jest.fn()
      }
    }
    jest.spyOn(serverHelper, 'createServer').mockResolvedValue(server)
    jest.spyOn(config, 'get').mockReturnValueOnce('127.0.0.0')

    await startServer()
    expect(server.start).toHaveBeenCalled()
    expect(server.logger.info.mock.calls[0][0]).toBe(
      'Server started successfully'
    )
    expect(server.logger.info.mock.calls[1][0]).toBe(
      'Access your frontend on http://localhost:127.0.0.0'
    )
  })

  test('Should catch the error if server failed to start', async () => {
    const errorMock = jest.fn()
    const infoMock = jest.fn()

    jest.spyOn(loggerFunc, 'createLogger').mockReturnValue({
      error: errorMock,
      info: infoMock
    })
    jest
      .spyOn(serverHelper, 'createServer')
      .mockRejectedValue('there was an error')
    await startServer()
    expect(infoMock.mock.calls[0][0]).toBe('Server failed to start :(')
    expect(errorMock.mock.calls[0][0]).toBe('there was an error')
  })
})
