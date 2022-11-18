import { z } from 'zod'
import { zDate } from '../zod/z-dates'

export const zIdentifiers = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
})

export const zTableAuditMutateDateFields = z.object({
  createdAt: zDate,
  updatedAt: zDate.nullable(),
})

export const zBaseEntity = z.object({}).merge(zIdentifiers).merge(zTableAuditMutateDateFields)

export const zBaseResponseDto = zIdentifiers.pick({ uuid: true }).merge(zTableAuditMutateDateFields)

export const zBaseRequestDto = zIdentifiers.pick({ uuid: true })
