export class AuthError extends Error {
  public readonly status: number

  constructor(message?: string) {
    // Error will break the prototype chain here (see line below with Object.setPrototypeOf)
    super(message)

    // explicitly set `name` property for stack traces
    this.name = AuthError.name
    this.status = 401

    // preserve prototype chain as required when extending a built-in class (ts 2.2+) (requires target >ES2015)
    Object.setPrototypeOf(this, AuthError.prototype)
  }

  getStatus(): number {
    return this.status
  }

  getErrorMessage(): string {
    return `Unauthorized (${this.status}): ${this.message}`
  }
}
