import React, { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import type { Nid } from '@firx/op-data-api'

export interface PlayerContext {
  /** Player URL `code`: a shortened nanoid with string type `Nid`. */
  code: Nid
}

const PlayerContext = React.createContext<PlayerContext | undefined>(undefined)

/**
 * Provides context about the current OliviaParty player to child context consumers.
 */
export const PlayerContextProvider: React.FC<{
  children: (isPlayerReady: boolean) => React.ReactElement
}> = ({ children }) => {
  const router = useRouter()

  const playerNid = typeof router.query['player'] === 'string' ? router.query['player'] : undefined

  const contextValue: PlayerContext | undefined = useMemo(() => {
    if (!playerNid) {
      return undefined
    }

    return {
      code: playerNid,
    }
  }, [playerNid])

  const isPlayerReady = typeof playerNid === 'string' && !!contextValue
  return <PlayerContext.Provider value={contextValue}>{children(isPlayerReady)}</PlayerContext.Provider>
}

/**
 * Hook for child components of `PlayerContextProvider` to access `PlayerContext` data.
 */
export function usePlayerContext(): PlayerContext {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error('Player context unavailable. Ensure hook is called within a child of PlayerContextProvider.')
  }

  return context
}
