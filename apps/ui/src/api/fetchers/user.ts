import { UserProfileDto } from '@firx/op-data-api'
import { apiFetch } from '../lib/api-fetch'

const REST_ENDPOINT_BASE = '/user' as const
const DATA_ENDPOINT_NAME = 'profile' as const

export const userRoutes: Readonly<Record<string, string>> = {
  profile: `${REST_ENDPOINT_BASE}/${DATA_ENDPOINT_NAME}`,
}

export async function fetchUserProfile(): Promise<UserProfileDto> {
  return apiFetch<UserProfileDto>(userRoutes.profile, {
    method: 'GET',
  })
}

export async function fetchMutateUserProfile({ data }: { data: Partial<UserProfileDto> }): Promise<UserProfileDto> {
  return apiFetch<UserProfileDto>(userRoutes.profile, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
