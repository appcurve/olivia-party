import { ApiError } from '../lib/errors/ApiError.class'
import { AuthError } from '../lib/errors/AuthError.class'
import { NetworkError } from '../lib/errors/NetworkError.class'
import { FormError } from '../lib/errors/FormError.class'

const testFireApiError = (): void => {
  throw new ApiError('Test Message', 400)
}

const testFireAuthError = (): void => {
  throw new AuthError('Test Message')
}

const testFireNetworkError = (): void => {
  throw new NetworkError('Test Message', 500)
}

const testFireFormError = (data?: unknown): void => {
  throw new FormError('Test Message', 422, data)
}

const testFireApiErrorStatus = (status: number): number => {
  try {
    throw new ApiError('Test Message', status)
  } catch (error: unknown) {
    return error instanceof ApiError ? error.status : 0
  }
}

const testFireNetworkErrorStatus = (status: number): number => {
  try {
    throw new NetworkError('Test Message', status)
  } catch (error: unknown) {
    return error instanceof NetworkError ? error.status : 0
  }
}

const testFireFormErrorStatus = (status: number): number => {
  try {
    throw new FormError('Test Message', status)
  } catch (error: unknown) {
    return error instanceof FormError ? error.status : 0
  }
}

describe('ApiError', () => {
  it('should throw and be recognized as an ApiError', () => {
    expect(() => testFireApiError()).toThrow(ApiError)
    expect(() => testFireApiError()).toThrow('Test Message')
  })

  it('should have a status property that can be set via constructor', () => {
    expect(testFireApiErrorStatus(400)).toEqual(400)
    expect(testFireApiErrorStatus(403)).toEqual(403)
  })
})

describe('AuthError', () => {
  it('should throw and be recognized as an AuthError', () => {
    expect(() => testFireAuthError()).toThrow(AuthError)
    expect(() => testFireApiError()).toThrow('Test Message')
  })
})

describe('NetworkError', () => {
  it('should throw and be recognized as an NetworkError', () => {
    expect(() => testFireNetworkError()).toThrow(NetworkError)
    expect(() => testFireApiError()).toThrow('Test Message')
  })

  it('should have a status property that can be set via constructor', () => {
    expect(testFireNetworkErrorStatus(500)).toEqual(500)
    expect(testFireNetworkErrorStatus(503)).toEqual(503)
  })
})

describe('FormError', () => {
  it('should throw and be recognized as an FormError', () => {
    expect(() => testFireFormError()).toThrow(FormError)
    expect(() => testFireApiError()).toThrow('Test Message')
  })

  it('should have a status property that can be set via constructor', () => {
    expect(testFireFormErrorStatus(400)).toEqual(400)
    expect(testFireFormErrorStatus(422)).toEqual(422)
  })
})
