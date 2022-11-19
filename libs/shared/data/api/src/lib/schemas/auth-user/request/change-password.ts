import { z } from 'zod'
import { zPassword } from '../../../zod/z-password'

export const zChangePassword = z.object({
  oldPassword: z.string().min(1),
  newPassword: zPassword,
})

export interface ChangePasswordDto extends z.infer<typeof zChangePassword> {}
