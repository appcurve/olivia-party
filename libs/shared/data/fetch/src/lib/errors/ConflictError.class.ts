export class ConflictError extends Error {
  public readonly status: number

  constructor(message?: string, status: number = 409) {
    // Error will break the prototype chain here (see line below with Object.setPrototypeOf)
    super(message)

    // explicitly set `name` property for stack traces
    this.name = ConflictError.name
    this.status = status

    // preserve prototype chain as required when extending a built-in class (ts 2.2+) (requires target >ES2015)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }

  getStatus(): number {
    return this.status
  }

  getErrorMessage(): string {
    return `Conflict (${this.status}): ${this.message}`
  }
}
