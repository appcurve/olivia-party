/**
 * Custom error class for errors related to network + connectivity.
 */
export class NetworkError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    // Error will break the prototype chain here (see next line)
    super(message)

    // preserve prototype chain as required when extending a built-in class (ts 2.2+)
    Object.setPrototypeOf(this, NetworkError.prototype)

    // explicitly set `name` property for stack traces
    this.name = NetworkError.name

    this.status = status
  }

  getErrorMessage(): string {
    return `API error (${this.status}): ${this.message}`
  }
}
