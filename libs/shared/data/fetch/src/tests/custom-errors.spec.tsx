import { ApiError } from '../lib/errors/ApiError.class'
import { AuthError } from '../lib/errors/AuthError.class'
import { NetworkError } from '../lib/errors/NetworkError.class'
import { FormError } from '../lib/errors/FormError.class'
import { RequestValidationErrorDto } from '@firx/op-data-api'

const testFireApiError = (): void => {
  throw new ApiError('Test Message', 400)
}

const testFireCatchApiErrorStatus = (status: number): number => {
  try {
    throw new ApiError('Test Message', status)
  } catch (error: unknown) {
    return error instanceof ApiError ? error.status : 0
  }
}

const testFireAuthError = (): void => {
  throw new AuthError('Test Message')
}

const testFireNetworkError = (): void => {
  throw new NetworkError('Test Message', 500)
}

const testFireCatchNetworkErrorStatus = (status: number): number => {
  try {
    throw new NetworkError('Test Message', status)
  } catch (error: unknown) {
    return error instanceof NetworkError ? error.status : 0
  }
}

// expect to generally be called with 400 or 422 status errors (422 in case of form field validation issues)
const testFireFormErrorWithData = (status: number, data?: unknown): void => {
  throw new FormError('Test Message', status, data)
}

// FormErrors must be instantiated with `data: RequestValidationErrorDto` or the constructor should throw
const testFireCatchFormErrorStatus = (status: number, data?: unknown): number => {
  try {
    throw new FormError('Test Message', status, data)
  } catch (error: unknown) {
    return error instanceof FormError ? error.status : 0
  }
}

describe('ApiError', () => {
  it('instantiates as ApiError', () => {
    expect(() => testFireApiError()).toThrow(ApiError)
    expect(() => testFireApiError()).toThrow('Test Message')
  })

  it('has a public status property set via its constructor', () => {
    expect(testFireCatchApiErrorStatus(400)).toEqual(400)
    expect(testFireCatchApiErrorStatus(403)).toEqual(403)
  })
})

describe('AuthError', () => {
  it('instantiates as AuthError', () => {
    expect(() => testFireAuthError()).toThrow(AuthError)
    expect(() => testFireAuthError()).toThrow('Test Message')
  })
})

describe('NetworkError', () => {
  it('instantiates as NetworkError', () => {
    expect(() => testFireNetworkError()).toThrow(NetworkError)
    expect(() => testFireNetworkError()).toThrow('Test Message')
  })

  it('has a public status property set via its constructor', () => {
    expect(testFireCatchNetworkErrorStatus(500)).toEqual(500)
    expect(testFireCatchNetworkErrorStatus(503)).toEqual(503)
  })
})

describe('FormError', () => {
  const validData: RequestValidationErrorDto = {
    general: [
      {
        code: 'general_code',
        message: 'general_message',
      },
    ],
    fields: {
      name: [
        {
          code: 'name_field_code',
          message: 'name_field_message',
        },
      ],
      password: [
        {
          code: 'password_field_code_1',
          message: 'password_field_message_1',
        },
        {
          code: 'password_field_code_2',
          message: 'password_field_message_2',
        },
      ],
    },
  }

  // property values are not arrays
  const invalidData1 = {
    general: {
      code: 'wrong',
      message: 'wrong_message',
    },
    fields: {},
  }

  const invalidData2 = {
    general: [
      {
        code: 'wrong',
        message: 'wrong_message',
      },
    ],
    fields: {
      example: [
        {
          code: 1234,
          message: 'code_is_wrong_type',
        },
      ],
    },
  }

  it('instantiates new FormErrors created with valid RequestValidationErrorDto data', () => {
    expect(() => testFireFormErrorWithData(422, validData)).toThrow(FormError)
    expect(() => testFireFormErrorWithData(400, validData)).toThrow('Test Message')
  })

  it('has a constructor that throws an Error if created with invalid RequestValidationErrorDto data', () => {
    expect(() => testFireFormErrorWithData(422, undefined)).toThrow(Error)
    expect(() => testFireFormErrorWithData(422, undefined)).not.toThrow(FormError)
    expect(() => testFireFormErrorWithData(400, invalidData1)).toThrow(Error)
    expect(() => testFireFormErrorWithData(400, invalidData1)).not.toThrow(FormError)
    expect(() => testFireFormErrorWithData(422, invalidData2)).toThrow(Error)
    expect(() => testFireFormErrorWithData(422, invalidData2)).not.toThrow(FormError)

    expect(() => testFireFormErrorWithData(422, invalidData1)).toThrow(/invalid/i)
  })

  it('has a public status property set via its constructor', () => {
    expect(testFireCatchFormErrorStatus(400, validData)).toEqual(400)
    expect(testFireCatchFormErrorStatus(422, validData)).toEqual(422)
  })
})
