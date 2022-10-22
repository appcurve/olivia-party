import { BoxProfileDto } from '@firx/op-data-api'
import { apiFetch } from '../lib/api-fetch'

const REST_ENDPOINT_BASE = '/opx' as const

export async function fetchBoxProfiles(): Promise<BoxProfileDto[]> {
  const endpoint = REST_ENDPOINT_BASE

  return apiFetch<BoxProfileDto[]>(endpoint, {
    method: 'GET',
  })
}
