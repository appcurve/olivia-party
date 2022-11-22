/**
 * Generic type assertion function asserts the given input has a value.
 *
 * Specifically this function throws an Error if the input is **not** `NonNullable`,
 * i.e. it will throw if the input **is** _nullish_: `null` or `undefined`.
 */
export function assertNonNullable<T>(input: T, errorMessage?: string): asserts input is NonNullable<T> {
  if (input === null || input === undefined) {
    throw Error(errorMessage ?? 'NonNullable assertion error: input value is null or undefined')
  }
}
