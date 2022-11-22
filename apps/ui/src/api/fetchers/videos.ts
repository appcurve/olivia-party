import { apiFetchData } from '../lib/api-fetch-data'
import type { VideoDto, CreateVideoDto, UpdateVideoDto, RequiredIdentifier, VideoDataParams } from '@firx/op-data-api'
import { buildDataQueryString } from '@firx/op-data-api'
import { ParentContext, assertPlayerParentContext } from '../../context/ParentContextProvider'

const REST_ENDPOINT_BASE = '/opx' as const
const DATA_ENDPOINT_NAME = 'videos' as const

const assertParentContext = assertPlayerParentContext

export async function fetchVideos(parentContext?: ParentContext['player']): Promise<VideoDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<VideoDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideosWithParams({
  parentContext,
  params,
}: {
  parentContext?: ParentContext['player']
  params?: VideoDataParams
}): Promise<VideoDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}${
    params ? `?${buildDataQueryString(params)}` : ''
  }`

  return apiFetchData<VideoDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideo({
  parentContext,
  uuid,
}: {
  parentContext?: ParentContext['player']
  uuid?: string
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<VideoDto>(`${endpoint}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreateVideo({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['player']
  data: CreateVideoDto
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<VideoDto>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchMutateVideo({
  parentContext,
  data: { uuid, ...data },
}: {
  parentContext?: ParentContext['player']
  data: RequiredIdentifier<UpdateVideoDto>
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<VideoDto>(`${endpoint}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchDeleteVideo({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['player']
  data: { uuid?: string }
}): Promise<void> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  await apiFetchData<void>(`${endpoint}/${data.uuid}`, {
    method: 'DELETE',
  })
}
