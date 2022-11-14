import { z } from 'zod'

export const zValidationError = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
})

export const zValidationErrors = z.record(z.string().min(1), z.array(zValidationError))

export const zRequestValidationError = z.object({
  general: z.array(zValidationError),
  fields: zValidationErrors,
})

export interface ValidationErrorDto extends z.infer<typeof zValidationError> {}

export interface ValidationErrorsDto extends z.infer<typeof zValidationErrors> {}

export interface RequestValidationError extends z.infer<typeof zRequestValidationError> {}
