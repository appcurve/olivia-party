/**
 * Type guard that evaluates if the given input is a TypeScript `Record`.
 */
export function isRecord(x: unknown): x is Record<string | number | symbol, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}
