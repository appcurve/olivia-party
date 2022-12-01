import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { UserInternalDto } from '@firx/op-data-api'

export type AuthUser = UserInternalDto

/**
 * Param decorator that returns the authenticated user as added to the ExpressJS `request` object
 * by a given PassportJS strategy when processing a request by an authenticated user.
 */
export const AuthUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
