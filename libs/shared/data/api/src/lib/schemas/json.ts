import { z } from 'zod'

export type JsonLiteral = boolean | number | string
export type Json = JsonLiteral | { [key: string]: Json } | Json[]
export const zLiteralSchema = z.union([z.string(), z.number(), z.boolean()])

/**
 * Zod schema representing JSON data.
 */
export const zJsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([zLiteralSchema, z.array(zJsonSchema), z.record(zJsonSchema)]),
)
