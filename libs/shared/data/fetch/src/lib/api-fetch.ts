import { EventEmitter } from 'events'
import { getCsrfCookieValue } from './cookies'
import { ApiError } from './errors/ApiError.class'
import { AuthError } from './errors/AuthError.class'
import { ConflictError } from './errors/ConflictError.class'
import { FormError } from './errors/FormError.class'
import { NetworkError } from './errors/NetworkError.class'

/** Request timeout duration in ms used by `apiFetch()`. */
const API_RETRY_TIMEOUT = 5000 as const

/** API route convention for authentication (sign-in). */
const AUTH_ROUTE = '/auth/sign-in' as const

/** API route convention for authentication refresh. */
const REFRESH_ROUTE = '/auth/refresh' as const

let apiEvents: EventEmitter | null = null
export function getApiEvents(): EventEmitter {
  if (!apiEvents) {
    apiEvents = new EventEmitter()
  }
  return apiEvents
}

export const EVENT_AUTH_ERROR = 'AuthError' as const
export const EVENT_NETWORK_ERROR = 'NetworkError' as const

/**
 * Fetch options for the project fetch wrapper `apiFetch()`.
 *
 * This interface is the same as the options for native fetch (`RequestInit`) except the `signal` and `credentials`
 * are omitted as they are reserved for internal use by the `apiFetch()` implementation.
 *
 * @see ApiFetch
 */
export interface ApiFetchOptions extends Omit<RequestInit, 'signal' | 'credentials'> {}

/**
 * Configuration options for the project fetch wrapper `apiFetch()`.
 *
 * These would typically be provided as an argument to the factory `createApiFetchFunction()` which returns
 * a copy of `apiFetch()` that applies this configuration.
 *
 * @see createApiFetchFunction
 * @see apiFetch
 */
export interface ApiFetchConfig {
  /**
   * Optional CSRF/XSRF feature for use with API's that implement a level of CSRF/XSRF protection using a
   * variation of the stateless Double-Submit-Cookie Pattern.
   */
  csrf?: {
    /** Request header to use to send the cookie value back in requests (e.g. 'CSRF-Token'). */
    requestHeader: string

    /** Name of the cookie containing the CSRF/XSRF token value to send back to the API in request headers. */
    cookieName: string
  }
}

/** Flag used by `apiFetch()` that is set to `true` when the results of a refresh token request are pending. */
let refreshRequestIsPending: boolean = false

/**
 * Flag used by `apiFetch()` to indicate that current credentials are known to be invalid.
 * This flag is set to `true` after a request + subsequent automatic refresh fails and
 */
let isFetchLocked: boolean = false

/**
 * Return a boolean indicating if the given request URL corresponds to the API's authentication route.
 * Assumes the API is a REST API that adheres to project conventions.
 *
 * @see apiFetch
 */
export const isAuthRequest = (requestUrl: string, options?: RequestInit): boolean => {
  return requestUrl.includes(AUTH_ROUTE) && options?.method?.toUpperCase() === 'POST'
}

/**
 * Infer the authentication refresh URL of an API that corresponds to the given request URL.
 * Assumes the API is a REST API that adheres to project conventions.
 *
 * @see apiFetch
 */
export const inferRefreshTokenUrl = (requestUrl: string): string => {
  const url = new URL(requestUrl)

  const protocol = url.protocol
  const domain = url.hostname

  // local development is assumed not to implement the /v\d* version url convention
  if (['localhost', '127.0.0.1', '::1'].some((local) => url.hostname.includes(local))) {
    return `${protocol}://${domain}/api/${REFRESH_ROUTE}`
  }

  // regex capture group for the base path of an API that follows /api/v\d* convention (capture e.g. 'api/v1', 'api/v99')
  const match = requestUrl.match(/\/(api\/v\d*)\//i)
  if (match === null || match.length !== 2) {
    throw new Error('Invalid requestUrl: API route conventions do not comply with project conventions.')
  }

  return `${protocol}://${domain}/${match[1]}/${REFRESH_ROUTE}`
}

/**
 * Send a POST request to the given token refresh endpoint URL.
 *
 * @see apiFetch
 */
async function refreshAuthToken(url: string): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    // hypothetical example of using an auth scheme where refresh token is sent via the body
    // body: JSON.stringify({ refresh: authTokens.refresh }),
  })

  if (!response.ok) {
    throw new AuthError('API error: failed to refresh authentication token')
  }

  // hypothetical example of using an auth scheme with localStorage...
  // const data = await response.json()
  // localStorage.setItem('authTokens', JSON.stringify(data))
  // return data
}

/**
 * Project `fetch()` wrapper for front-end apps to make requests to back-end REST API's that adhere to project
 * conventions.
 *
 * Required API conventions:
 *
 * - Cookie-based authentication using HttpOnly cookies with short-lived access + longer-lived refresh tokens
 * - Standardized routes for authentication + token refresh
 * - Responds with 401 for any requests to protected endpoints that have no credentials or invalid credentials
 *
 * The wrapper implements the following features:
 *
 * - Automatic token refresh + retry after a request to a route other than `auth/sign-in` is met with a 401 response
 * - Short request timeout (5s) standardized across browsers using `AbortController`
 * - Emits `EVENT_AUTH_ERROR` and `EVENT_NETWORK_ERROR` to `EventEmitter` singleton provided by `getApiEvents()`
 *
 * Optional options provided via the second argument can be used to override the fetch options built in to this function
 * with the exception of `signal`
 *
 * @todo return a CancellablePromise / PromiseWithCancel from apiFetch that's compatible with react-query cancel
 * @todo consider external API's e.g. handle 403 similar to 401 as many outside project technically-incorrectly use 403 vs. 401
 * @todo ensure ui auth revised so AuthError is essentially a sign-out and query to `/auth/session` is disabled
 *
 * @param url URL to endpoint route
 * @param options fetch options with the same interface as the native `fetch()` (`RequestInit`)
 * @param config optional configuration options for this function
 */
export async function apiFetch<T>(
  url: string,
  options?: Omit<RequestInit, 'signal' | 'credentials'>,
  config?: ApiFetchConfig,
): Promise<T>
export async function apiFetch(
  url: string,
  options?: Omit<RequestInit, 'signal' | 'credentials'>,
  config?: ApiFetchConfig,
): Promise<unknown> {
  // this particular implementation only supports use-cases of protected API's where auth is required for all
  // endpoints other than the authentication endpoint
  if (isFetchLocked && !isAuthRequest(url, options)) {
    return new AuthError('API error: not authenticated')
  }

  if (isAuthRequest(url, options)) {
    isFetchLocked = false
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_RETRY_TIMEOUT)

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',

        ...(!options?.method || options.method === 'GET' || config?.csrf === undefined
          ? {}
          : { [config.csrf.requestHeader]: getCsrfCookieValue(config.csrf.cookieName) }),

        // example if an authorization header is to be supported e.g.: 'Authorization': `Bearer ${token}`,
      },

      // spread arg options here to support ability to override all defaults except `signal` and `credentials`
      ...(options ?? {}),

      // abort signal
      signal: controller.signal,

      // set credentials as required for cors + cookie authentication
      credentials: 'same-origin', // vs. 'include'
    })

    if (!response.ok) {
      // request to refresh authentication token in the case of a 401 if a request is not already pending
      if (response.status === 401 && !refreshRequestIsPending && !url.endsWith('/auth/sign-in')) {
        refreshRequestIsPending = true
        await refreshAuthToken(inferRefreshTokenUrl(url))
        refreshRequestIsPending = false

        // @future track the count for this endpoint (url + http verb)?
        return apiFetch(url, options)
      }

      if (response.status >= 400 && response.status < 500) {
        try {
          const json = await response.json()

          // handle 409 response
          if (response.status === 409) {
            return Promise.reject(new ConflictError(json?.message))
          }

          // handle 400 + 422 responses to POST requests as form errors with an expected json data payload containing validation issues
          if (options?.method === 'POST' && (response.status === 400 || response.status === 422)) {
            return Promise.reject(new FormError('Validation Error', response.status, json))
          }
        } catch (error: unknown) {
          throw new ApiError(
            'Unexpected malformed response from API following form/data submission (invalid JSON)',
            response.status,
          )
        }
      }

      return Promise.reject(new ApiError(`API error: server response not OK (${response.status})`, response.status))
    }

    // unlock fetch if it was previously locked and this is a successful auth request
    if (isFetchLocked && isAuthRequest(url, options)) {
      isFetchLocked = false
    }

    try {
      // parse all http response status types except 204 (no content) as json (return {} in the 204 case to provide a truthy result)
      const json = response.status === 204 ? ({} as Record<string, never>) : await response.json()
      return json
    } catch (error: unknown) {
      return Promise.reject(new ApiError('Unexpected malformed response from API (invalid JSON)', response.status))
    }
  } catch (error: unknown) {
    // lock fetch if token refresh attempt failed
    if (error instanceof AuthError) {
      isFetchLocked = true
      getApiEvents().emit(EVENT_AUTH_ERROR)
      throw error
    }

    if (error instanceof ApiError || error instanceof FormError) {
      throw error
    }

    getApiEvents().emit(EVENT_NETWORK_ERROR)

    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      return Promise.reject(new NetworkError('API request cancelled due to timeout or explicit cancellation.', -1))
    }

    // throw NetworkError with status -1 in fall-back case
    throw new NetworkError(String(error), -1)
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Factory function that returns a copy of the project `apiFetch()` for making requests to back-end REST API's
 * that follow project conventions.
 *
 * `apiFetch()` wraps the browser `fetch()` and adds features including handling of auth + refresh tokens
 * (assuming an HttpOnly cookie-based auth strategy) and a standardized short timeout for requests.
 *
 * Refer to the tsdoc comment / inline documentation for the `apiFetch()` function for more details.
 *
 * The given `baseUrl` should _not_ have a trailing slash. API routes provided to the returned `apiFetch()`
 * function must have a preceding slash.
 *
 * Examples of baseUrl:
 *
 * - `http://localhost:4200/api` (local development with `proxy.conf.json` configuration forwarding to API)
 * - `https://{PROJECT_DOMAIN}/api/v1`
 *
 *
 * @param baseUrl base URL of the REST API with _no_ trailing slash
 * @returns project `apiFetch` function that may be called with arguments similar to the native `fetch()`
 * @see apiFetch
 */
export function createApiFetchFunction(
  baseUrl: string,
  config?: ApiFetchConfig,
): <T>(route: string, options?: RequestInit) => Promise<T> {
  return (url: string, options?: RequestInit) => apiFetch(`${baseUrl}${url}`, options, config)
}
