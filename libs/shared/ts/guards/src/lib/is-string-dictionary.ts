import { isRecord } from './is-record'

/**
 * Type guard that evaluates if its input is of type `Record<string, string>`.
 * Consider using `Map<K,V>` for reduced memory footprint and improved performance.
 *
 * The term _dictionary_ is a reference to python dict's (a key-value mapping type).
 */
export function isStringDictionary(x: unknown): x is Record<string, string> {
  return (
    isRecord(x) &&
    Object.getOwnPropertySymbols(x).length === 0 &&
    Object.entries(x).every(([key, value]) => typeof key === 'string' && typeof value === 'string')
  )
}
