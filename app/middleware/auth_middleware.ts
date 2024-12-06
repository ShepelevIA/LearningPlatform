import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users and users without appropriate roles.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[],
      roles?: string[],
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
  
      const user = ctx.auth.user
  
      if (!user) {
        return ctx.response.unauthorized({ message: 'Пользователь не найден' })
      }
  
      if (options.roles && !options.roles.includes(user.role)) {
        return ctx.response.forbidden({ message: 'Доступ запрещен: недостаточно прав' })
      }
    } catch (error) {
      return ctx.response.unauthorized({ message: 'Пользователь не авторизован!' })
    }
  
    return next()
  }
}