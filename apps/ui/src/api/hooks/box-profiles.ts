import type { BoxProfileDto } from '@firx/op-data-api'
import { createQueryCacheKeys } from '../lib/cache-keys'
import { createListQueryHook } from '../lib/query-hook-factories'
import { fetchBoxProfiles } from '../fetchers/box-profiles'

const QUERY_SCOPE = 'boxProfiles' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as boxProfileCacheKeys }

export const useBoxProfilesQuery = createListQueryHook<BoxProfileDto, undefined>({
  cacheKeys,
  fetchFn: fetchBoxProfiles,
})

// @todo refactor types to handle 'never' case for parentcontext type (and make that the default)
// - then `createStaticQueryHook()` could be eliminated (revise getOne case carefully so the cache keys are fine)
// - with a fetcher factory the caller of hook factory functions could pass scope string as arg and have the
//  creation of default fetcher functions internal to the hook factory implementation for a more simplified TS API.
//
// i.e. deprecate
// export const useBoxProfilesQuery = createStaticQueryHook({
//   cacheKey: 'boxProfile',
//   cacheKeys,
//   fetchFn: fetchBoxProfiles,
// })
