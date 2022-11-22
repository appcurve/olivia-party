import { PlayerDto } from '@firx/op-data-api'
import { apiFetchData } from '../lib/api-fetch-data'

const REST_ENDPOINT_BASE = '/opx' as const

export async function fetchPlayerProfiles(): Promise<PlayerDto[]> {
  const endpoint = REST_ENDPOINT_BASE

  return apiFetchData<PlayerDto[]>(endpoint, {
    method: 'GET',
  })
}
