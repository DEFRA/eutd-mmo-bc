import { loginController } from '~/src/server/login/controller.js'
import { config } from '~/src/config/index.js'
import AuthenticationClient from '~/src/server/common/helpers/authentication/client.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()
const azureAdConfig = config.get('azureAd')
const baseUrl = config.get('baseUrl')
const RESPONSE_SERVICE_UNAVAILABLE = 503
/**
 * Sets up the routes used in the /login page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
const path = '/login'

/**
 * Handler for initiating Azure AD login
 */
const handleLoginOut = async (_request, h) => {
  try {
    const client = await AuthenticationClient.getClient()
    const redirectUri = `${baseUrl}/auth/openid/return`

    const authorizationUrl = client.authorizationUrl({
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      response_mode: 'form_post'
    })

    logger.info('Redirecting to Azure AD login' + authorizationUrl)
    return h.redirect(authorizationUrl)
  } catch (error) {
    logger.error('Error initiating Azure AD login')
    logger.error(error)
    return h
      .response('Authentication service unavailable')
      .code(RESPONSE_SERVICE_UNAVAILABLE)
  }
}

/**
 * Handler for Azure AD OAuth callback
 */
const handleAuthCallback = (server) => async (request, h) => {
  try {
    const { payload } = request
    const client = await AuthenticationClient.getClient()
    const redirectUri = `${baseUrl}/auth/openid/return`
    const { state } = payload

    logger.info('Processing Azure AD callback')

    const tokenSet = await client.callback(redirectUri, payload, {
      state
    })
    const claims = tokenSet.claims()

    // Store token set in Azure AD cache
    const aadCache = server.app.aadCache
    await aadCache.set(
      claims.sub,
      {
        tokenSet,
        claims
      },
      undefined
    )

    // Set authentication cookie
    request.cookieAuth.set({
      sub: claims.sub,
      name: claims.name,
      ipaddr: claims.ipaddr || request.info.remoteAddress,
      session: tokenSet.session_state,
      role: claims.roles ? claims.roles[0] : undefined
    })

    logger.info('Azure AD authentication successful', {
      userId: claims.sub
    })

    return h.redirect(`${baseUrl}/admin`)
  } catch (error) {
    logger.error('Azure AD callback error')
    logger.error(error)
    return h.redirect('/login?error=auth_failed').takeover()
  }
}

/**
 * Handler for sign out
 */
const handleSignOut = (server) => async (request, h) => {
  const cookieName = azureAdConfig.cookieName
  let cacheKey

  try {
    cacheKey = request.state[cookieName]?.sub
  } catch (error) {
    logger.error('Error extracting cache key during sign-out')
    logger.error(error)
  }

  // Clear cache entry
  if (cacheKey && server.app.aadCache) {
    await server.app.aadCache.drop(cacheKey)
  }

  // Clear cookie
  request.cookieAuth.clear()

  // Redirect to Azure AD logout
  const logoutUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(baseUrl)}/`

  logger.info('Logging out from Azure AD')
  return h.redirect(logoutUri).takeover()
}

export const login = {
  plugin: {
    name: 'login',
    register(server) {
      server.route([
        {
          method: 'GET',
          path,
          options: {
            auth: {
              mode: 'try'
            }
          },
          ...loginController
        },
        {
          method: 'GET',
          path: '/login/out',
          options: {
            auth: false,
            description: 'Initiate Azure AD login',
            tags: ['api', 'auth']
          },
          handler: handleLoginOut
        },
        {
          method: ['GET', 'POST'],
          path: '/auth/openid/return',
          options: {
            auth: false,
            description: 'Azure AD OAuth callback',
            tags: ['api', 'auth'],
            plugins: {
              crumb: false // Disable CRUMB for OAuth callback
            }
          },
          handler: handleAuthCallback(server)
        },
        {
          method: 'GET',
          path: '/sign-out',
          options: {
            auth: {
              mode: 'try'
            }
          },
          handler: handleSignOut(server)
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
