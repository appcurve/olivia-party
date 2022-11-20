import React, { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'

import type { PlayerChildQueryContext } from '@firx/op-data-api'

/**
 * Generic parent context required for API queries for child data objects.
 *
 * This interface is intersected with the interface of the hook/fetch function argument object to add a
 * `parentContext` object with properties corresponding to the required identifiers.
 *
 * API data hooks and fetch functions that depend on parent context should provide these as the type/interface
 * argument `CTX` (parent context) to this generic, e.g. a query for line items belonging to a given invoice.
 *
 * Note: `CTX` is cast as a `PartialType` to satisfy the nuances of the underlying NextJS router + react-query.
 * All property values of `CTX` are required at the time of execution of any API query/fetch function.
 *
 * Any "fetcher" functions should be implemented to throw an Error if they are provided a `parentContext`
 * object (if/where one is required) that contains any `undefined`/nullish property values.
 *
 * @see ApiParentContext
 */
export interface ApiParentContext<CTX extends Record<string, unknown>> {
  parentContext: Partial<CTX>
}

export interface ParentContext {
  player: ApiParentContext<PlayerChildQueryContext>['parentContext']
}

export type ParentContextType = keyof ParentContext

const getRouterParamValue = (query: ParsedUrlQuery, key: string): string | undefined => {
  const value = query[key]
  return typeof value === 'string' ? value : undefined
}

const ParentContext = React.createContext<ParentContext | undefined>(undefined)

export const ParentContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const playerUuid = getRouterParamValue(router.query, 'player')

  const contextValue: ParentContext = useMemo(() => {
    return {
      player: {
        playerUuid,
      },
    }
  }, [playerUuid])

  return <ParentContext.Provider value={contextValue}>{children}</ParentContext.Provider>
}

/**
 * Provide parent context for project data objects obtained from url params populated via NextJS dynamic routes.
 */
export function useParentContext(): ParentContext {
  const context = useContext(ParentContext)

  if (context === undefined) {
    throw new Error('useParentContext must be used within a ParentContextProvider')
  }

  return context
}

// SC extends keyof ParentContext ? ParentContext[T] : SC extends undefined ? undefined : never

/**
 * Return the slice of `ParentContext` corresponding to the given `ParentContextType` key.
 *
 * Returns `undefined` if given the argument `undefined`.
 */
export function useSelectParentContext<T extends ParentContextType>(
  selectedContext: T | undefined,
): ParentContext[T] | undefined {
  const context = useContext(ParentContext)

  if (!context) {
    // error in console in case the hook is erroneously invoked
    // may fire in corner cases e.g. outgoing page when router redirecting to sign-in after tab reactivation
    console.error('useSelectParentContext must be invoked within a ParentContextProvider')
    return undefined
  }

  switch (selectedContext) {
    case 'player': {
      return context.player
    }
    case undefined: {
      return undefined
    }
  }
}

export const assertPlayerParentContext = (parentContext?: ParentContext['player']): true => {
  if (!parentContext?.playerUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return true
}
