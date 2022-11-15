import { isRequestValidationErrorDto, RequestValidationErrorDto } from '@firx/op-data-api'

export class FormError extends Error {
  public readonly status: number
  private readonly data: RequestValidationErrorDto | undefined

  constructor(message: string, status: number, data?: unknown) {
    // Error will break the prototype chain here (see line below with Object.setPrototypeOf)
    super(message)

    // explicitly set `name` property for stack traces
    this.name = FormError.name
    this.status = status

    if (data && isRequestValidationErrorDto(data)) {
      this.data = data
    } else {
      if (process.env['NODE_ENV'] !== 'production') {
        throw Error('FormError constructed with invalid API response data')
      }
    }

    // preserve prototype chain as required when extending a built-in class (ts 2.2+) (requires target >ES2015)
    Object.setPrototypeOf(this, FormError.prototype)
  }

  getErrorMessage(): string {
    return `Form submit error (${this.status}): ${this.message}`
  }

  getStatus(): number {
    return this.status
  }

  getData(): RequestValidationErrorDto | undefined {
    return this.data
  }
}
