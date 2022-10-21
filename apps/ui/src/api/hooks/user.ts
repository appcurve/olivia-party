import { UserProfileDto } from '@firx/op-data-api'
import { fetchMutateUserProfile, fetchUserProfile } from '../fetchers/user'
import { createQueryCacheKeys } from '../lib/cache-keys'
import { createMutateQueryHook, createStaticQueryHook } from '../lib/query-hook-factories'

const QUERY_SCOPE = 'user' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as videoQueryCacheKeys }

export const useUserProfileQuery = createStaticQueryHook({
  cacheKey: 'profile',
  cacheKeys,
  fetchFn: fetchUserProfile,
})

export const useUserProfileMutateQuery = createMutateQueryHook<UserProfileDto, Partial<UserProfileDto>>({
  cacheKey: 'profile',
  cacheKeys,
  fetchFn: fetchMutateUserProfile,
})
