import type {
  PhraseListDto,
  CreatePhraseListDto,
  UpdatePhraseListDto,
  RequiredIdentifier,
  VideoDataParams,
} from '@firx/op-data-api'
import { buildDataQueryString } from '@firx/op-data-api'

import { apiFetchData } from '../lib/api-fetch-data'
import { ParentContext, assertPlayerParentContext } from '../../context/ParentContextProvider'

const REST_ENDPOINT_BASE = '/opx' as const
const DATA_ENDPOINT_NAME = 'phrases' as const

const assertParentContext = assertPlayerParentContext

// @todo DRY refactor to create a fetch function factory vs copypasta

export async function fetchPhraseLists(parentContext?: ParentContext['player']): Promise<PhraseListDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<PhraseListDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchPhraseListsWithParams({
  parentContext,
  params,
}: {
  parentContext?: ParentContext['player']
  params?: VideoDataParams
}): Promise<PhraseListDto[]> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}${
    params ? `?${buildDataQueryString(params)}` : ''
  }`

  return apiFetchData<PhraseListDto[]>(endpoint, {
    method: 'GET',
  })
}

export async function fetchPhraseList({
  parentContext,
  uuid,
}: {
  parentContext?: ParentContext['player']
  uuid?: string
}): Promise<PhraseListDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<PhraseListDto>(`${endpoint}/${uuid}`, {
    method: 'GET',
  })
}

export async function fetchCreatePhraseList({
  parentContext,
  data,
}: {
  parentContext?: ParentContext['player']
  data: CreatePhraseListDto
}): Promise<PhraseListDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<PhraseListDto>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchMutatePhraseList({
  parentContext,
  data: { uuid, ...data },
}: {
  parentContext?: ParentContext['player']
  data: RequiredIdentifier<UpdatePhraseListDto>
}): Promise<PhraseListDto> {
  assertParentContext(parentContext)
  const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.playerUuid}/${DATA_ENDPOINT_NAME}`

  return apiFetchData<PhraseListDto>(`${endpoint}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchDeletePhraseList({
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
