import { z } from 'zod'

/**
 * Make the zod schema given as input optional.
 */
export function zConvertToOptional<T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> {
  return schema.optional()
}

// /**
//  * Make the given zod schema required.
//  *
//  * If the given schema is an instance of `ZodOptional` it will be returned `unwrap()`'d.
//  *
//  * need confirmation of zod behavior and test
//  */
// export function zConvertToRequired<T extends z.ZodOptional>(schema: T): z.ZodTypeAny<T> {
//   const x = schema.unwrap().required()

//   return schema
// }

// @wip unsure of typing (zod learning curve - check docs)
// export function zConvertToStrict<T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> {
//   return schema.unwrap().strict()
// }
