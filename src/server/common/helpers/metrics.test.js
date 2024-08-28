import { counter } from '~/src/server/common/helpers/metrics.js'
import { config } from '~/src/config/index.js'
import * as loggerFunc from '~/src/server/common/helpers/logging/logger.js'
import * as awsMetrics from 'aws-embedded-metrics'

describe('#metrics', () => {
  const warnMock = jest.fn()

  beforeEach(() => {
    jest.spyOn(loggerFunc, 'createLogger').mockReturnValue({
      warn: warnMock
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return if it is not production', async () => {
    jest.spyOn(config, 'get').mockReturnValueOnce(false)
    jest.spyOn(awsMetrics, 'createMetricsLogger')

    await counter()
    expect(awsMetrics.createMetricsLogger).not.toHaveBeenCalled()
    expect(warnMock).not.toHaveBeenCalled()
  })

  test('Should log the error if mertics fails', async () => {
    jest.spyOn(config, 'get').mockReturnValueOnce(true)
    jest
      .spyOn(awsMetrics, 'createMetricsLogger')
      .mockReturnValueOnce(Error('there was an error'))

    await counter()
    expect(warnMock).toHaveBeenCalled()
  })

  test('Should call metrics', async () => {
    jest.spyOn(config, 'get').mockReturnValueOnce(true)
    const flushMock = jest.fn().mockResolvedValue(true)
    const putMock = jest.fn()
    jest.spyOn(awsMetrics, 'createMetricsLogger').mockReturnValue({
      putMetric: putMock,
      flush: flushMock
    })

    await counter('clicks')
    expect(warnMock).not.toHaveBeenCalled()
    expect(flushMock).toHaveBeenCalled()
    expect(putMock).toHaveBeenCalledWith('clicks', 1, 'Count', 60)
  })
})
