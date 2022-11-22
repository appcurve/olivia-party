import type {
  CreateVideoPlaylistDto,
  UpdateVideoPlaylistDto,
  VideoPlaylistDataParams,
  VideoPlaylistDto,
} from '@firx/op-data-api'

import {
  fetchCreateVideoPlaylist,
  fetchDeleteVideoPlaylist,
  fetchMutateVideoPlaylist,
  fetchVideoPlaylist,
  fetchVideoPlaylists,
  fetchVideoPlaylistsWithParams,
} from '../fetchers/video-playlists'
import { createQueryCacheKeys } from '../lib/cache-keys'
import {
  createCreateQueryHook,
  createDeleteQueryHook,
  createListDataQueryHook,
  createListQueryHook,
  createMutateQueryHook,
  createSingleQueryHook,
} from '../lib/query-hook-factories'

const QUERY_SCOPE = 'VideoPlaylists' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as VideoPlaylistCacheKeys }

export const useVideoPlaylistsQuery = createListQueryHook<VideoPlaylistDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideoPlaylists,
})

export const useVideoPlaylistsDataQuery = createListDataQueryHook<VideoPlaylistDto, 'player', VideoPlaylistDataParams>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideoPlaylistsWithParams,
})

export const useVideoPlaylistQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideoPlaylist,
})

export const useVideoPlaylistCreateQuery = createCreateQueryHook<VideoPlaylistDto, CreateVideoPlaylistDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchCreateVideoPlaylist,
})

export const useVideoPlaylistMutateQuery = createMutateQueryHook<VideoPlaylistDto, UpdateVideoPlaylistDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchMutateVideoPlaylist,
})

export const useVideoPlaylistDeleteQuery = createDeleteQueryHook<VideoPlaylistDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchDeleteVideoPlaylist,
})
