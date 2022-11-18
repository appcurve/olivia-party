import { z } from 'zod'

export function zodParseDate(arg: unknown): Date | undefined {
  if (typeof arg == 'string' || arg instanceof Date) {
    return new Date(arg)
  }

  return undefined
}

export const zDate = z.preprocess(zodParseDate, z.date())

export const zYear = z.preprocess(
  // could potentially use regex as well
  (val) => Number(val) || undefined,
  z
    .number()
    .min(new Date().getFullYear() - 101)
    .max(new Date().getFullYear() - 1)
    .optional(),
)
