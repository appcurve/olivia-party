import { apiFetch } from '../lib/api-fetch'

import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import { buildDataQueryString, type DataQueryParams } from '@firx/op-data-api'
import { ParentContext } from '../../context/ParentContextProvider'
import { RequiredIdentifier } from '../lib/query-hook-factories'

const REST_ENDPOINT_BASE = '/opx' as const

// @todo share between API + UI type re what the accepted params are
export type VideoGroupsDataParams = DataQueryParams<VideoGroupDto, 'name', never>

// the optional parentContext is to support nuances of nextjs router + react-query with greater flexibility
// the fetchers will throw (via `getVideoGroupsRestEndpoint()`) if any values are undefined

const assertParentContext = (parentContext?: ParentContext['box']): true => {
  if (!parentContext?.boxProfileUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return true
}

export async function fetchVideoGroups(parentContext?: ParentContext['box']): Promise<VideoGroupDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups`

  return apiFetch<VideoGroupDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideoGroupsWithParams({
  parentContext,
  params,
}: {
  parentContext?: ParentContext['box']
  params?: VideoGroupsDataParams
}): Promise<VideoGroupDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups${
    params ? `?${buildDataQueryString(params)}` : ''
  }`

  return apiFetch<VideoGroupDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchVideoGroup({
  parentContext,
  uuid,
}: {
  parentContext?: ParentContext['box']
  uuid?: string
}): Promise<VideoGroupDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups`

  return apiFetch<VideoGroupDto>(`${endpoint}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreateVideoGroup({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['box']
  data: CreateVideoGroupDto
}): Promise<VideoGroupDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups`

  return apiFetch<VideoGroupDto>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchMutateVideoGroup({
  parentContext,
  data: { uuid, ...data },
}: {
  parentContext?: ParentContext['box']
  data: RequiredIdentifier<UpdateVideoGroupDto>
}): Promise<VideoGroupDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups`

  return apiFetch<VideoGroupDto>(`${endpoint}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchDeleteVideoGroup({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['box']
  data: { uuid?: string }
}): Promise<void> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/video-groups`

  await apiFetch<void>(`${endpoint}/${data.uuid}`, {
    method: 'DELETE',
  })
}
