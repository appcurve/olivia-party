import { z } from 'zod'

export const emptyStringAndNullToUndefined = (arg: unknown): string | undefined => {
  if (arg === null || arg === undefined) {
    return undefined
  }

  return String(arg).trim() || undefined
}

export const stringToInt = (arg: unknown): number | undefined =>
  typeof arg == 'string' && /^\d+$/.test(arg) ? parseInt(arg, 10) : undefined

// string to number (int) (integers only but regex can be revised to support decimals)
export const stringToNumber = (arg: unknown): unknown => {
  const processed = z.string().trim().regex(/^\d+$/).transform(Number).safeParse(arg)
  return processed.success ? processed.data : arg
}
