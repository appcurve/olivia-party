/**
 * Generic type assertion function that throws an Error if the given input is **not** `NonNullable`,
 * i.e. throw if the value is _nullish_ (`null` or `undefined`).
 */
export function assertNonNullable<T>(input: T, errorMessage?: string): asserts input is NonNullable<T> {
  if (input === null || input === undefined) {
    throw Error(errorMessage ?? 'NonNullable assertion error: input value is null or undefined')
  }
}
