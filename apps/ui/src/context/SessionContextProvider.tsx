import React, { useMemo, useContext, useState, useEffect } from 'react'

import { LOCAL_STORAGE_SESSION_CTX_FLAG_KEY } from '../api/constants/auth'
import type { AuthSession } from '../types/session.types'
import type { SessionStatus } from '../types/enums/session.enums'
import { useAuthSessionQuery } from '../api/hooks/auth'
import { isAuthSessionResult } from '../types/type-guards/auth.type-guards'

const SessionContext = React.createContext<AuthSession<SessionStatus> | undefined>(undefined)

/**
 * Context provider for the session of an authenticated user.
 *
 * The default initial `isQueryEnabled` state of `true` triggers an immediate request to the API's
 * `/auth/session` endpoint (via the `useAuthSessionQuery()` hook) on a fresh page load or refresh.
 *
 * The API response indicates if a user is authenticated and if so provides the user's details.
 * If the API implements a double-submit cookie pattern (DSCP) the initial request + response serves
 * as a means for the back-end to provide a CSRF/XSRF token.
 */
export const SessionContextProvider: React.FC<{
  children: (isSessionReady: boolean) => React.ReactElement
}> = ({ children }) => {
  const [isQueryEnabled, setIsQueryEnabled] = useState<boolean>((): boolean => {
    if (typeof window !== 'undefined') {
      const ctxEnabledFlag = window.localStorage.getItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY)
      return ctxEnabledFlag === 'enabled'
    }

    return true
  })
  const { data: profile, refetch, error, status, invalidate, remove } = useAuthSessionQuery(isQueryEnabled)

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY, isQueryEnabled ? 'enabled' : 'disabled')
  }, [isQueryEnabled])

  // memoize to ensure a stable context value
  const contextValue: AuthSession<SessionStatus> | undefined = useMemo(() => {
    const isLoading = status === 'loading'

    if (profile) {
      return { profile, setEnabled: setIsQueryEnabled, isLoading, refetch, invalidate, remove }
    }

    return {
      error: (error instanceof Error && error) || new Error(`Unexpected error loading session: ${String(error)}`),
      setEnabled: setIsQueryEnabled,
      isLoading,
      refetch,
      invalidate,
      remove,
    }
  }, [profile, status, error, refetch, invalidate, remove])

  const isSessionReady = status !== 'loading' && !!profile
  return <SessionContext.Provider value={contextValue}>{children(isSessionReady)}</SessionContext.Provider>
}

export function useSessionContext(): AuthSession<SessionStatus> | undefined {
  const ctx = useContext(SessionContext)
  return ctx
}

export function useAuthSession(): AuthSession<SessionStatus.READY>
export function useAuthSession(options?: { optional?: boolean }): AuthSession<SessionStatus.READY> | null
export function useAuthSession(options?: { optional?: boolean }): AuthSession<SessionStatus.READY> | null {
  const ctx = useContext(SessionContext)

  // the optional flag disables the default behaviour to throw an Error if the session isn't loaded
  if (!!options?.optional && (!ctx || !ctx?.profile)) {
    return null
  }

  if (isAuthSessionResult(ctx)) {
    return ctx
  }

  if (!ctx) {
    throw new Error('User session data not loaded')
  }

  if (ctx.error && ctx.error instanceof Error) {
    throw ctx.error
  }

  // the error case can happen when dev server refreshing
  // throw new Error('Unexpected API data error: failed to obtain a valid user session')
  return null // try null instead
}
