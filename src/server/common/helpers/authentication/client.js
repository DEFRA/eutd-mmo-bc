import { Issuer } from 'openid-client'
import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

Issuer.defaultHttpOptions = {
  timeout: 5000,
  retries: 2
}

/**
 * Azure AD OpenID Connect client for authentication
 */
class AuthenticationClient {
  static #clientInstance = null

  /**
   * Get or create the OpenID Connect client
   * @returns {Promise<import('openid-client').Client>}
   */
  static async getClient() {
    if (this.#clientInstance) {
      return this.#clientInstance
    }

    const azureConfig = config.get('azureAd')
    const clientId = azureConfig.clientId
    const clientSecret = azureConfig.clientSecret
    const tenantId = azureConfig.tenantId

    if (!clientId || !clientSecret || !tenantId) {
      throw new Error(
        'Azure AD configuration missing. Ensure AAD_CLIENTID, AAD_CLIENTSECRET, and AAD_TENANTID are set.'
      )
    }

    const discoveryUri = `https://login.microsoftonline.com/${tenantId}/.well-known/openid-configuration`

    logger.info('Instantiating Azure AD issuer...')

    const issuer = await Issuer.discover(discoveryUri)

    logger.info('Azure AD issuer instantiated')
    logger.info('Instantiating OpenID Connect client...')

    this.#clientInstance = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret
    })

    logger.info('OpenID Connect client instantiated')

    return this.#clientInstance
  }

  /**
   * Clear the cached client instance (useful for testing)
   */
  static clearClient() {
    this.#clientInstance = null
  }
}

export default AuthenticationClient

/**
 * @import { Client } from 'openid-client'
 */
