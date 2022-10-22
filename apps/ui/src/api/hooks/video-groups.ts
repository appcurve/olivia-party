import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDataParams, VideoGroupDto } from '@firx/op-data-api'

import {
  fetchCreateVideoGroup,
  fetchDeleteVideoGroup,
  fetchMutateVideoGroup,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsWithParams,
} from '../fetchers/video-groups'
import { createQueryCacheKeys } from '../lib/cache-keys'
import {
  createCreateQueryHook,
  createDeleteQueryHook,
  createListDataQueryHook,
  createListQueryHook,
  createMutateQueryHook,
  createSingleQueryHook,
} from '../lib/query-hook-factories'

const QUERY_SCOPE = 'videoGroups' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as videoGroupCacheKeys }

export const useVideoGroupsQuery = createListQueryHook<VideoGroupDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideoGroups,
})

export const useVideoGroupsDataQuery = createListDataQueryHook<VideoGroupDto, 'box', VideoGroupDataParams>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideoGroupsWithParams,
})

export const useVideoGroupQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideoGroup,
})

export const useVideoGroupCreateQuery = createCreateQueryHook<VideoGroupDto, CreateVideoGroupDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchCreateVideoGroup,
})

export const useVideoGroupMutateQuery = createMutateQueryHook<VideoGroupDto, UpdateVideoGroupDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchMutateVideoGroup,
})

export const useVideoGroupDeleteQuery = createDeleteQueryHook<VideoGroupDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchDeleteVideoGroup,
})
