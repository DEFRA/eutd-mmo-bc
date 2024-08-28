import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'
import { config } from '~/src/config/index.js'
import * as redisClient from '~/src/server/common/helpers/redis-client.js'
import * as loggerFunc from '~/src/server/common/helpers/logging/logger.js'

describe('#cache-engine', () => {
  const errorMock = jest.fn()
  const warnMock = jest.fn()

  beforeEach(() => {
    jest.spyOn(loggerFunc, 'createLogger').mockReturnValue({
      error: errorMock,
      warn: warnMock
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should get the correct cache engine if redis is enabled', () => {
    const redisConfig = {
      host: '127.0.0.1',
      username: '',
      pasword: '',
      keyPrefix: 'eutd-mmo-bc:',
      useSingleInstanceCache: 'true'
    }
    jest
      .spyOn(config, 'get')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(redisConfig)

    jest.spyOn(redisClient, 'buildRedisClient')

    const response = getCacheEngine()
    expect(redisClient.buildRedisClient.mock.calls[0][0]).toStrictEqual(
      redisConfig
    )
    expect(response.settings.client.connector.options.keyPrefix).toBe(
      'eutd-mmo-bc:'
    )
    expect(errorMock).not.toHaveBeenCalled()
    expect(warnMock).not.toHaveBeenCalled()
  })

  test('Should get the correct cache engine if in production', () => {
    jest
      .spyOn(config, 'get')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)

    jest.spyOn(redisClient, 'buildRedisClient')

    getCacheEngine()
    expect(redisClient.buildRedisClient).not.toHaveBeenCalled()
    expect(errorMock.mock.calls[0][0]).toBe('Catbox Memory used in production')
    expect(warnMock).not.toHaveBeenCalled()
  })

  test('Should get the correct cache engine for default option', () => {
    jest
      .spyOn(config, 'get')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    jest.spyOn(redisClient, 'buildRedisClient')

    getCacheEngine()
    expect(redisClient.buildRedisClient).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
    expect(warnMock.mock.calls[0][0]).toBe(
      'Catbox Memory used for server side cache, this could cause issues if used in production - See README'
    )
  })
})
