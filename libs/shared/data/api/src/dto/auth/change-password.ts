import { z } from 'zod'
import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

export const zChangePassword = z.object({
  oldPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => !!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/), {
      message: 'Password must include at least one lowercase letter, one uppercase letter, and a digit',
    }),
})

export const zChangePasswordApiDto = extendApi(zChangePassword, {
  title: 'Change Password',
  description: 'Change login password of an authenticated user.',
})

export interface ChangePasswordDto extends z.infer<typeof zChangePassword> {}

export class ChangePasswordApiDto extends createZodDto(zChangePasswordApiDto) {}
