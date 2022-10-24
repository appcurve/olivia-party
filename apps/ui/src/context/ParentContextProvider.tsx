import React, { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'

import type { BoxProfileChildQueryContext } from '@firx/op-data-api'
import type { ApiParentContext } from '../api/types/common.types'

export interface ParentContext {
  box: ApiParentContext<BoxProfileChildQueryContext>['parentContext']
}

export type ParentContextType = keyof ParentContext

const getRouterParamValue = (query: ParsedUrlQuery, key: string): string | undefined => {
  const value = query[key]
  return typeof value === 'string' ? value : undefined
}

const ParentContext = React.createContext<ParentContext | undefined>(undefined)

export const ParentContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const boxProfileUuid = getRouterParamValue(router.query, 'box')

  const contextValue: ParentContext = useMemo(() => {
    return {
      box: {
        boxProfileUuid,
      },
    }
  }, [boxProfileUuid])

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
    case 'box': {
      return context.box
    }
    case undefined: {
      return undefined
    }
  }
}
