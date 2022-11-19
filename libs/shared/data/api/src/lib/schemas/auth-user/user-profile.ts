import { z } from 'zod'
// import type { UserProfile } from '@prisma/client'

import { zOptionalText } from '../../zod/z-text'
import { zYear } from '../../zod/z-dates'
import { emptyStringAndNullToUndefined } from '../../zod/processors'
import { zBaseResponseDto } from '../common'

export const zUserProfileFields = z.object({
  playerUserName: z.preprocess(emptyStringAndNullToUndefined, z.string().min(1).optional()).nullish(),
  playerUserYob: zYear.nullish(),

  bio: zOptionalText.nullable(),
  country: z.preprocess(emptyStringAndNullToUndefined, z.string().length(2).optional()).nullish(),
  locale: z.preprocess(emptyStringAndNullToUndefined, z.string().min(2).max(5).optional()).optional(),
  timeZone: z.preprocess(emptyStringAndNullToUndefined, z.string().min(2).max(30).optional()).optional(),
  currency: z.preprocess(emptyStringAndNullToUndefined, z.string().length(3).optional()).optional().nullish(),
})

export const zUserProfile = zBaseResponseDto.merge(zUserProfileFields)

export interface UserProfileDto extends z.infer<typeof zUserProfile> {}
