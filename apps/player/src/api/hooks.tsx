import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import type { PlayerDto } from '@firx/op-data-api'
import { usePlayerContext } from '../context/PlayerContextProvider'
import { fetchPlayerData } from './fetch'

export const usePlayerQuery = (): UseQueryResult<PlayerDto> => {
  const { code } = usePlayerContext()
  const fetchFunction = (): Promise<PlayerDto> => fetchPlayerData({ nid: code })

  return useQuery<PlayerDto, Error>([{ scope: 'player', nid: code }], fetchFunction, {
    enabled: typeof code === 'string' && !!code.length,
  })
}
