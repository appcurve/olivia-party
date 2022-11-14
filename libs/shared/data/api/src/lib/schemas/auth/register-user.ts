import { z } from 'zod'
import { zPassword } from '../../zod/z-password'

export const zRegisterUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: zPassword,
  locale: z.string().min(2).max(5).optional(),
  timezone: z.string().min(2).max(30).optional(),
  currency: z.string().min(3).max(3).optional(),
})

export interface RegisterUserDto extends z.infer<typeof zRegisterUser> {}
