import { z } from 'zod'
import { PhraseListSchemaVersion } from '@prisma/client'

import { zApiDto, zBaseResponseDto, zBaseEntity } from '../../common'
import { zJsonSchema } from '../../json'
import type { DataQueryParams } from '../../../../types/data-query-params.interface'

export const zPhrase = zJsonSchema

export const zPhrase_v1 = z.object({
  phrase: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().nullish(),
})

export const zPhraseList = z.object({
  name: z.string(),
  phrases: z.array(zPhrase_v1), // json field in database (supertype: zJsonSchema)
  schemaVersion: z.nativeEnum(PhraseListSchemaVersion),
  enabledAt: z.date().optional(),
  boxProfileId: z.number().int(),
})

export const zPhraseListFields = zBaseEntity.merge(zPhraseList)

export const zPhraseListDto = zBaseResponseDto.merge(zPhraseList)
export const zCreatePhraseListDto = zPhraseList.pick({ name: true, phrases: true }).merge(
  z.object({
    enabled: z.boolean().optional(),
  }),
)
export const zUpdatePhraseListDto = zApiDto.merge(zPhraseList.partial())

/**
 * Generic type of a phrase: an individual item in a `PhraseList` by version.
 * Generic version `V` is in format `/v\d+/`, e.g. "v1", "v2", etc.
 *
 * @see PhraseListSchemaVersion
 */
export type PhraseDto<V extends keyof typeof PhraseListSchemaVersion> = V extends 'v1' ? PhraseDto_v1 : never

/**
 * Interface of a phrase (item) in a `PhraseList` version `PhraseListSchemaVersion.v1`.
 */
export interface PhraseDto_v1 extends z.infer<typeof zPhrase_v1> {}

export interface PhraseListDto extends z.infer<typeof zPhraseListDto> {}

export interface CreatePhraseListDto extends Pick<PhraseListDto, 'name'> {
  phrases: PhraseDto<'v1'>[]
  enabled?: boolean
}

export type PhraseListDataParams = DataQueryParams<PhraseListDto, 'name', never>
