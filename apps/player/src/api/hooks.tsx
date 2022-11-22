import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import type { PlayerAppsDto } from '@firx/op-data-api'
import { usePlayerContext } from '../context/PlayerContextProvider'
import { fetchPlayerData } from './fetch'

export const usePlayerQuery = (): UseQueryResult<PlayerAppsDto> => {
  const { code } = usePlayerContext()
  const fetchFunction = (): Promise<PlayerAppsDto> => fetchPlayerData({ nid: code })

  return useQuery<PlayerAppsDto, Error>([{ scope: 'player', nid: code }], fetchFunction, {
    enabled: typeof code === 'string' && !!code.length,

    // @todo @temp move to supporting refresh as a feature/requirement after initial implementation
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}
