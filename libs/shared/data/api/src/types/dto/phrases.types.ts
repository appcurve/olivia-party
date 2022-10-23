import type { PhraseList, PhraseListSchemaVersion } from '@prisma/client'
import type { ApiDataObject } from './api.types'
import { DataQueryParams } from '../data-query-params.interface'

/**
 * Interface of a phrase (item) in a `PhraseList` version `PhraseListSchemaVersion.v1`.
 */
export interface PhraseDto_v1 {
  phrase: string
  label: string
  emoji: string | undefined
}

/**
 * Type of a phrase (item) in a `PhraseList` by generic `V` version.
 */
export type PhraseDto<V extends keyof typeof PhraseListSchemaVersion> = V extends 'v1' ? PhraseDto_v1 : never

export interface PhraseListDto
  extends ApiDataObject,
    Pick<PhraseList, 'uuid' | 'createdAt' | 'updatedAt' | 'name' | 'schemaVersion' | 'phrases'> {
  enabled: boolean
}

export type PhraseListDataParams = DataQueryParams<PhraseListDto, 'name', never>

export interface CreatePhraseListDto extends Pick<PhraseListDto, 'name'> {
  phrases: PhraseDto<'v1'>[]
  enabled?: boolean
}

export interface UpdatePhraseListDto extends Partial<PhraseListDto> {}
