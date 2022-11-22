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

export const usePhraseListsQuery = createListQueryHook<PhraseListDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchPhraseLists,
})

export const usePhraseListsDataQuery = createListDataQueryHook<PhraseListDto, 'player', PhraseListDataParams>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchPhraseListsWithParams,
})

export const usePhraseListQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchPhraseList,
})

export const usePhraseListCreateQuery = createCreateQueryHook<PhraseListDto, CreatePhraseListDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchCreatePhraseList,
})

export const usePhraseListMutateQuery = createMutateQueryHook<PhraseListDto, UpdatePhraseListDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchMutatePhraseList,
})

export const usePhraseListDeleteQuery = createDeleteQueryHook<PhraseListDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchDeletePhraseList,
})
