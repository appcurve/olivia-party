/**
 * General-case back-end/API error for 500 and other errors that are not covered by
 * `AuthError` or `FormError`.
 */
export class ApiError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    // Error will break the prototype chain here (see line below with Object.setPrototypeOf)
    super(message)

    // explicitly set `name` property for stack traces
    this.name = ApiError.name
    this.status = status

    // preserve prototype chain as required when extending a built-in class (ts 2.2+) (requires target >ES2015)
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  getStatus(): number {
    return this.status
  }

  getErrorMessage(): string {
    return `API error (${this.status}): ${this.message}`
  }
}
