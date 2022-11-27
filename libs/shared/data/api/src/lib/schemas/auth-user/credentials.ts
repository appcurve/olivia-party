import { z } from 'zod'
import { zPassword } from '../../zod/z-password'

export const zSignIn = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password cannot be blank'),
})

export const zChangePassword = z.object({
  oldPassword: z.string().min(1),
  newPassword: zPassword,
})

export interface SignInDto extends z.infer<typeof zSignIn> {}

export interface ChangePasswordDto extends z.infer<typeof zChangePassword> {}
