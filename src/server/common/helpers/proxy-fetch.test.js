import { proxyFetch } from '~/src/server/common/helpers/proxy-fetch.js'
import { config } from '~/src/config/index.js'
import * as undici from 'undici'

const agent = new undici.MockAgent()
agent.disableNetConnect()
const client = agent.get('https://localhost:3000')
client
  .intercept({
    path: '/admin',
    method: 'GET'
  })
  .reply(200)
undici.setGlobalDispatcher(agent)

describe('#proxy-fetch', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should return default proxy', async () => {
    jest.spyOn(config, 'get').mockReturnValueOnce(null)
    const response = await proxyFetch('https://localhost:3000/admin', {})
    expect(response.url).toBe('https://localhost:3000/admin')
  })
})
