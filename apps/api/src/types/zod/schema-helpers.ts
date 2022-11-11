import { z } from 'zod'

/**
 * Zod number string: a string containing a valid number.
 */
export const zodNumString = z
  .string()
  .min(1)
  .refine(
    (val) => !Number.isNaN(Number(val)),
    (val) => ({ message: `${val} is not a number.` }),
  )

/**
 * Zod number: preprocessed with `Number()` constructor so numerical strings are converted to type `number`.
 */
export const zodNumber = z.preprocess(Number, z.number())

/**
 * Zod API_OPT value of "ON" or "OFF" and converts it to corresponding `boolean` type.
 * Intended for parsing environment variable values API_OPT prefix per project convention.
 */
export const zodEnvToggleOption = z.preprocess(
  (arg: unknown) => (arg === 'ON' ? true : arg === 'OFF' ? false : undefined),
  z.boolean(),
)
