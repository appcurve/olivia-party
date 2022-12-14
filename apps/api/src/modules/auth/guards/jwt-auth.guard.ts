import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import type { Observable } from 'rxjs'

import { FX_KEY_IS_PUBLIC_ROUTE_HANDLER } from '../decorators/public-route-handler.decorator'

/**
 * AuthGuard to enforce JWT authentication.
 *
 * This guard implements a conditional override/bypass and will allow unauthenticated (public) requests
 * to any controller route handler decorated with the `@PublicRouteHandler()` decorator.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(FX_KEY_IS_PUBLIC_ROUTE_HANDLER, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}
