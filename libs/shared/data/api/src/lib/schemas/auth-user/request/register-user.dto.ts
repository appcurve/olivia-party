import { z } from 'zod'

import { zUser } from '../user'
import { zUserProfile } from '../user-profile'

// reminder: consider zod-form-data npm package for canned form data helpers

// export const zRegisterUser = z.object({
//   name: z.string().min(1),
//   email: z.string().email(),
//   password: zPassword,

//   playerUserName: zOptionalText,
//   playerUserYob: zYear,
//   country: z.preprocess((val) => String(val).trim() || undefined, z.string().length(2).optional()).optional(),
//   locale: z.preprocess((val) => String(val).trim() || undefined, z.string().min(2).max(5).optional()).optional(),
//   timeZone: z.preprocess((val) => String(val).trim() || undefined, z.string().min(2).max(30).optional()).optional(),
//   currency: z.preprocess((val) => String(val).trim() || undefined, z.string().length(3).optional()).optional(),
// })

export const zRegisterUser = z
  .object({})
  .merge(zUser.pick({ name: true, email: true, password: true }))
  .merge(zUserProfile)

export interface RegisterUserDto extends z.infer<typeof zRegisterUser> {}
