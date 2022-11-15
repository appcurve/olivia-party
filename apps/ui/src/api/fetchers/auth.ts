import type { AuthUser } from '../../types/auth.types'

import { apiFetch } from '../lib/api-fetch'

/**
 * Available endpoints of the back-end API related to authentication.
 *
 * The project fetch implementation makes use of the token refresh point and
 * the remaining queries are used via react-query.
 */
export type AuthQueryEndpoint = 'session' | 'refresh' | 'register' | 'signIn' | 'signOut'

/**
 * User credentials required to sign-in to the back-end API.
 * @todo move AuthSignInCredentials to shared lib and standardize to evolved project conventions.
 */
export interface AuthSignInCredentials {
  email: string
  password: string
}

export type RegisterUserResponse = { name: string; email: string }

export const authQueryEndpointRoutes: Record<AuthQueryEndpoint, Readonly<string>> = {
  session: '/auth/session' as const,
  refresh: '/auth/refresh' as const,
  register: '/auth/register' as const,
  signIn: '/auth/sign-in' as const,
  signOut: '/auth/sign-out' as const,
}

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(authQueryEndpointRoutes.session)
}

export async function fetchSignIn({ email, password }: AuthSignInCredentials): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signIn, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export async function fetchSignOut(): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signOut, {
    method: 'POST',
  })
}

export async function fetchRegister({ ...data }): Promise<RegisterUserResponse> {
  return apiFetch<RegisterUserResponse>(authQueryEndpointRoutes.register, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
