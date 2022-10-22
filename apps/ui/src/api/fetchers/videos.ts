import { apiFetch } from '../lib/api-fetch'
import type { VideoDto, CreateVideoDto, UpdateVideoDto, RequiredIdentifier, VideoDataParams } from '@firx/op-data-api'
import { buildDataQueryString } from '@firx/op-data-api'
import { ParentContext } from '../../context/ParentContextProvider'
import { assertBoxParentContext } from '../validators/parent-context-assertions'

const REST_ENDPOINT_BASE = '/opx' as const
const assertParentContext = assertBoxParentContext

export async function fetchVideos(parentContext?: ParentContext['box']): Promise<VideoDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

  return apiFetch<VideoDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideosWithParams({
  parentContext,
  params,
}: {
  parentContext?: ParentContext['box']
  params?: VideoDataParams
}): Promise<VideoDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos${
    params ? `?${buildDataQueryString(params)}` : ''
  }`

  return apiFetch<VideoDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideo({
  parentContext,
  uuid,
}: {
  parentContext?: ParentContext['box']
  uuid?: string
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

  return apiFetch<VideoDto>(`${endpoint}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreateVideo({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['box']
  data: CreateVideoDto
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

  return apiFetch<VideoDto>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchMutateVideo({
  parentContext,
  data: { uuid, ...data },
}: {
  parentContext?: ParentContext['box']
  data: RequiredIdentifier<UpdateVideoDto>
}): Promise<VideoDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

  return apiFetch<VideoDto>(`${endpoint}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchDeleteVideo({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['box']
  data: { uuid?: string }
}): Promise<void> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

  await apiFetch<void>(`${endpoint}/${data.uuid}`, {
    method: 'DELETE',
  })
}
