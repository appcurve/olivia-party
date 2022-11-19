import { z } from 'zod'
import { zDate } from '../zod/z-dates'

/**
 * Entity identifiers: unique `id` + `uuid` fields for internal use by project API's.
 * Only `uuid` should be exposed to the public.
 *
 * @future potential optimization for larger datasets is to adopt a UUID scheme that can be sequentially ordered.
 */
export const zDataObject = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
})

/**
 * ApiObject is a base DTO with a unique `uuid` identifier.
 */
export const zApiObject = z.object({
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
 * Schema representing the minimum fields (base entity) of a typical database table / data object.
 */
export const zBaseEntity = z.object({}).merge(zDataObject).merge(zTableAuditMutateDateFields)

/**
 * Schema representing the minimum fields of a DTO associated with a database entity.
 */
export const zBaseDto = zApiObject.merge(zTableAuditMutateDateFields)
