import { apiFetch } from '../lib/api-fetch'
import type {
  CreateVideoGroupDto,
  UpdateVideoGroupDto,
  VideoGroupDto,
  RequiredIdentifier,
  VideoGroupDataParams,
} from '@firx/op-data-api'
import { buildDataQueryString } from '@firx/op-data-api'
import { ParentContext } from '../../context/ParentContextProvider'
import { assertBoxParentContext } from '../validators/parent-context-assertions'

const assertParentContext = assertBoxParentContext
const REST_ENDPOINT_BASE = '/opx' as const

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
  params?: VideoGroupDataParams
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
