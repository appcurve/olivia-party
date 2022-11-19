import { z } from 'zod'
import { zDate } from '../zod/z-dates'

/**
 * Entity identifiers: unique `id` + `uuid` fields for internal use by project API's.
 * Only `uuid` should be exposed to the public.
 *
 * @future potential optimization for larger datasets is to adopt a UUID scheme that can be sequentially ordered.
 */
export const zDataObject = z.object({
  id: z.number().int(),
  uuid: z.string().uuid(),
})

/**
 * Common foundation of many request + response DTO's: an object containing a unique `uuid` identifier.
 */
export const zApiDto = z.object({
  uuid: z.string().uuid(),
})

/**
 * Base audit fields for `createdAt` and `updatedAt` common to most entities.
 */
export const zTableAuditMutateDateFields = z.object({
  createdAt: zDate,
  updatedAt: zDate,
})

/**
 * Common minimum fields of a typical database table (i.e. a base entity or base model).
 */
export const zBaseEntity = zDataObject.merge(zTableAuditMutateDateFields)

/**
 * Common properties of API response DTO's corresponding to records in a project database.
 */
export const zBaseResponseDto = zApiDto.merge(zTableAuditMutateDateFields)

/**
 * Object containing the identifier property `uuid`.
 */
export interface ApiDto extends z.infer<typeof zApiDto> {}

export interface BaseResponseDto extends z.infer<typeof zBaseResponseDto> {}

// export interface BaseResponseDto extends z.infer<typeof zApiDto> {
//   createdAt: Date | string
//   updatedAt: Date | string
// }
