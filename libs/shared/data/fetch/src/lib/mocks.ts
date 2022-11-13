/**
 * Dev/test helper function that returns a Promise that resolves or rejects after the given timeout in ms.
 *
 * For success provide the result object or array of objects as the first argument, otherwise set this
 * argument to `false` to produce a failure (reject) outcome.
 *
 * Optionally provide a timeout value via the second argument in ms. Default: 500ms.
 *
 * @param success object or array of objects for success `resolve()` case, or `false` for failure `reject()` case
 * @param timeout duration in ms (default: 500ms)
 * @returns Promise that resolves or rejects after timeout depending on the given args.
 */
export function mockAsyncResult<T extends object | object[]>(success: T | false, timeout?: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(success)
      } else {
        reject({ message: 'Error (mock)' })
      }
    }, timeout ?? 500)
  })
}
