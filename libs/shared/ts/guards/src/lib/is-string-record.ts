import { isRecord } from './is-record'

/**
 * Type guard that evaluates if the given input is a TypeScript Record with
 * string keys and values: `Record<string, string>`.
 */
export function isStringRecord(x: unknown): x is Record<string, string> {
  return (
    isRecord(x) &&
    Object.getOwnPropertySymbols(x).length === 0 &&
    Object.entries(x).every(([key, value]) => typeof key === 'string' && typeof value === 'string')
  )
}
