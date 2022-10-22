import { PhraseList } from '@prisma/client'
import type { ApiDataObject } from './api.types'
import { DataQueryParams } from '../data-query-params.interface'

/**
 * Interface of a phrase (item) in a `PhraseList` corresponding to `PhraseListSchemaVersion` 'v1'.
 */
export interface Phrase {
  phrase: string
  label: string
  emoji?: string
  version: string
}

export interface PhraseListDto
  extends ApiDataObject,
    Pick<PhraseList, 'uuid' | 'name' | 'schemaVersion' | 'phrases' | 'createdAt' | 'updatedAt' | 'enabledAt'> {}

export type PhraseListDataParams = DataQueryParams<PhraseListDto, 'name', never>

export interface CreatePhraseListDto extends Pick<PhraseListDto, 'name' | 'phrases'> {
  enabled?: boolean
}

export interface UpdatePhraseListDto extends Partial<PhraseListDto> {}
