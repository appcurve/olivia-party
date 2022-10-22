import type { CreatePhraseListDto, UpdatePhraseListDto, PhraseListDataParams, PhraseListDto } from '@firx/op-data-api'

import {
  fetchCreatePhraseList,
  fetchDeletePhraseList,
  fetchMutatePhraseList,
  fetchPhraseList,
  fetchPhraseLists,
  fetchPhraseListsWithParams,
} from '../fetchers/phrases'
import { createQueryCacheKeys } from '../lib/cache-keys'
import {
  createCreateQueryHook,
  createDeleteQueryHook,
  createListDataQueryHook,
  createListQueryHook,
  createMutateQueryHook,
  createSingleQueryHook,
} from '../lib/query-hook-factories'

const QUERY_SCOPE = 'phraseLists' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as phraseListCacheKeys }

export const usePhraseListsQuery = createListQueryHook<PhraseListDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchPhraseLists,
})

export const usePhraseListsDataQuery = createListDataQueryHook<PhraseListDto, 'box', PhraseListDataParams>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchPhraseListsWithParams,
})

export const usePhraseListQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchPhraseList,
})

export const usePhraseListCreateQuery = createCreateQueryHook<PhraseListDto, CreatePhraseListDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchCreatePhraseList,
})

export const usePhraseListMutateQuery = createMutateQueryHook<PhraseListDto, UpdatePhraseListDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchMutatePhraseList,
})

export const usePhraseListDeleteQuery = createDeleteQueryHook<PhraseListDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchDeletePhraseList,
})
