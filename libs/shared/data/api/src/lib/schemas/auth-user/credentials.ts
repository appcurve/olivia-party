import { z } from 'zod'
import { zPassword } from '../../zod/z-password'

export interface SignInDto extends z.infer<typeof zSignInDto> {}
export interface ChangePasswordDto extends z.infer<typeof zChangePasswordDto> {}

export const zSignInDto = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password cannot be blank'),
})

export const zChangePasswordDto = z.object({
  oldPassword: z.string().min(1),
  newPassword: zPassword,
})
