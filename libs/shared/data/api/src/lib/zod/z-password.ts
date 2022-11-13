import { z } from 'zod'

export const zPassword = z
  .string()
  .min(8)
  .max(128)
  .refine((value) => !!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/), {
    message: 'Password requires at least a lowercase letter, an uppercase letter, and a digit',
  })
