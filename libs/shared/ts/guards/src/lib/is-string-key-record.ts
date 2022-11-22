import { isRecord } from './is-record'

/**
 * Type guard that evaluates if its input is of type `Record<string, unknown>`.
 */
export function isStringKeyRecord(x: unknown): x is Record<string, unknown> {
  return (
    isRecord(x) &&
    Object.getOwnPropertySymbols(x).length === 0 &&
    Object.keys(x).every((key) => typeof key === 'string')
  )
}
