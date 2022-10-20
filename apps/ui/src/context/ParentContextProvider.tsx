import React, { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'

import type { ApiParentContext } from '../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../types/box-profiles.types'

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

export function useSelectParentContext<T extends keyof ParentContext>(
  selectedContext: T | undefined,
): ParentContext[T] | undefined {
  const context = useContext(ParentContext)

  if (!context) {
    throw new Error('useSelectParentContext must be invoked within a ParentContextProvider')
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
