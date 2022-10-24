import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SanitizedUser } from '../types/sanitized-user.type'

/**
 * Param decorator that returns the authenticated user as added to the ExpressJS `request` object
 * by a given PassportJS strategy when processing a request by an authenticated user.
 */
export const AuthUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SanitizedUser => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
