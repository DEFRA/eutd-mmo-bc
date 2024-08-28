import { proxyAgent } from '~/src/server/common/helpers/proxy-agent.js'
import { config } from '~/src/config/index.js'

describe('#proxy-agent', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return null if there is no proxy in the config', () => {
    jest.spyOn(config, 'get').mockReturnValueOnce(null)
    const response = proxyAgent()
    expect(response).toBeNull()
  })

  test('Should return proxy for https', () => {
    jest.spyOn(config, 'get').mockReturnValueOnce('https://localhost:3000')
    const response = proxyAgent()
    expect(response.url.toString()).toBe('https://localhost:3000/')
    expect(response.agent.connectOpts).toStrictEqual({
      ALPNProtocols: ['http/1.1'],
      host: 'localhost',
      port: 3000
    })
  })

  test('Should return proxy for http', () => {
    jest
      .spyOn(config, 'get')
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('http://localhost:4000')
    const response = proxyAgent()
    expect(response.url.toString()).toBe('http://localhost:4000/')
    expect(response.agent.connectOpts).toStrictEqual({
      ALPNProtocols: ['http/1.1'],
      host: 'localhost',
      port: 4000
    })
  })
})
