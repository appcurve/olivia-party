import { z } from 'zod'

/**
 * Make the zod schema given as input optional.
 */
export function zConvertToOptional<T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> {
  return schema.optional()
}
