import { apiFetch } from '../lib/api-fetch'

import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'
import { buildDataQueryString, type DataQueryParams } from '@firx/op-data-api'

// @todo refactor video group api types to shared nx lib
// const VIDEO_GROUPS_REST_ENDPOINT = '/opx/video-groups' as const

// partial is to support nuances of nextjs router with more flexibility
// the fetchers will throw (via `getVideoGroupsRestEndpoint()`) if any values are undefined

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const REST_ENDPOINT_BASE = '/opx' as const

// @todo share between API + UI type re what the accepted params are
export type VideoGroupsDataParams = DataQueryParams<VideoGroupDto, 'name', never>

const getRestEndpoint = ({ boxProfileUuid }: ParentContext['parentContext'], params?: VideoGroupsDataParams): string => {
  if (!boxProfileUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return `${REST_ENDPOINT_BASE}/${boxProfileUuid}/video-groups${params ? `?${buildDataQueryString(params)}` : ''}`
}

export async function fetchVideoGroups({ parentContext }: ParentContext): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(getRestEndpoint(parentContext), {
    method: 'GET',
  })
}

export async function fetchVideoGroupsWithParams({parentContext, params }: ParentContext & { params?: VideoGroupsDataParams }): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(
    getRestEndpoint(parentContext, params),
    {
      method: 'GET',
    },
  )
}

export async function fetchVideoGroup({
  parentContext,
  uuid,
}: ParentContext & { uuid?: string }): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreateVideoGroup({
  parentContext,
  ...data
}: CreateVideoGroupDto & ParentContext): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(getRestEndpoint(parentContext), {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchCreateVideoGroupWithParentContext(
  parentContext: ParentContext['parentContext'],
): (data: CreateVideoGroupDto) => Promise<VideoGroupDto> {
  return (data: CreateVideoGroupDto) => fetchCreateVideoGroup({ parentContext, ...data })
}

export async function fetchMutateVideoGroup({
  parentContext,
  uuid,
  ...data
}: ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function fetchMutateVideoGroupWithParentContext(
  parentContext: ParentContext['parentContext'],
): (uuidAndData: ApiMutateRequestDto<UpdateVideoGroupDto>) => Promise<VideoGroupDto> {
  return (uuidAndData: ApiMutateRequestDto<UpdateVideoGroupDto>) =>
    fetchMutateVideoGroup({ parentContext, ...uuidAndData })
}

export async function fetchDeleteVideoGroup({
  parentContext,
  uuid,
}: ApiDeleteRequestDto & ParentContext): Promise<void> {
  await apiFetch<void>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'DELETE',
  })
}

export function fetchDeleteVideoGroupWithParentContext(
  parentContext: ParentContext['parentContext'],
): (uuid: ApiDeleteRequestDto) => Promise<void> {
  return (uuid: ApiDeleteRequestDto) => fetchDeleteVideoGroup({ parentContext, ...uuid })
}
