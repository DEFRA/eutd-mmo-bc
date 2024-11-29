import { confirmationController } from '~/src/server/admin/confirmation/controller.js'

/**
 * Sets up the routes used in the /admin/confirmation page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const confirmationRoutes = [
  {
    method: 'GET',
    path: '/admin/confirmation/{certificateNumber}/{status}',
    ...confirmationController
  }
]
