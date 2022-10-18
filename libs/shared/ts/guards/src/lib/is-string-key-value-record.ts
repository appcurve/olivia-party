import { isRecord } from './is-record'

/**
 * Type guard that evaluates if the given input is a TypeScript Record of
 * key-values where both keys and values are strings: `Record<string, string>`.
 */
export function isStringKeyValueRecord(x: unknown): x is Record<string, string> {
  return (
    isRecord(x) &&
    Object.getOwnPropertySymbols(x).length === 0 &&
    Object.entries(x).every(([key, value]) => typeof key === 'string' && typeof value === 'string')
  )
}
