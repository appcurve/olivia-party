import { apiFetch } from '../lib/api-fetch'
import type {
  CreateVideoPlaylistDto,
  UpdateVideoPlaylistDto,
  VideoPlaylistDto,
  RequiredIdentifier,
  VideoPlaylistDataParams,
} from '@firx/op-data-api'
import { buildDataQueryString } from '@firx/op-data-api'
import { ParentContext, assertPlayerParentContext } from '../../context/ParentContextProvider'

const REST_ENDPOINT_BASE = '/opx' as const
const DATA_ENDPOINT_NAME = 'video-playlists' as const

const assertParentContext = assertPlayerParentContext

export async function fetchVideoPlaylists(parentContext?: ParentContext['player']): Promise<VideoPlaylistDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetch<VideoPlaylistDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideoPlaylistsWithParams({
  parentContext,
  params,
}: {
  parentContext?: ParentContext['player']
  params?: VideoPlaylistDataParams
}): Promise<VideoPlaylistDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}${
    params ? `?${buildDataQueryString(params)}` : ''
  }`

  return apiFetch<VideoPlaylistDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideoPlaylist({
  parentContext,
  uuid,
}: {
  parentContext?: ParentContext['player']
  uuid?: string
}): Promise<VideoPlaylistDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetch<VideoPlaylistDto>(`${endpoint}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreateVideoPlaylist({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['player']
  data: CreateVideoPlaylistDto
}): Promise<VideoPlaylistDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetch<VideoPlaylistDto>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchMutateVideoPlaylist({
  parentContext,
  data: { uuid, ...data },
}: {
  parentContext?: ParentContext['player']
  data: RequiredIdentifier<UpdateVideoPlaylistDto>
}): Promise<VideoPlaylistDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetch<VideoPlaylistDto>(`${endpoint}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchDeleteVideoPlaylist({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['player']
  data: { uuid?: string }
}): Promise<void> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  await apiFetch<void>(`${endpoint}/${data.uuid}`, {
    method: 'DELETE',
  })
}
