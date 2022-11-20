import { PlayerDto } from '@firx/op-data-api'
import { apiFetch } from '../lib/api-fetch'

const REST_ENDPOINT_BASE = '/opx' as const

export async function fetchPlayerProfiles(): Promise<PlayerDto[]> {
  const endpoint = REST_ENDPOINT_BASE

  return apiFetch<PlayerDto[]>(endpoint, {
    method: 'GET',
  })
}
