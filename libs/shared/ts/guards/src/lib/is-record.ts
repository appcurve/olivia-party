/**
 * Type guard that evaluates if the given input is an object aka TypeScript
 * `Record<string | number | symbol, unknown>`.
 */
export function isRecord(x: unknown): x is Record<string | number | symbol, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}
