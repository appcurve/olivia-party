/** Base URL of the project's back-end API. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL

/**
 * Return the value of the cookie with the given `name`.
 * Returns `undefined` if the cookie does not exist, is not readable by client js (http-only), or has a falsey value.
 */
export function getCookie(name: string): string | undefined {
  if (typeof document?.cookie !== 'string') {
    return undefined
  }

  const cookies = document.cookie.split(';')
  const cookie = cookies.find((c) => c.trim().substring(0, name.length + 1) === `${name}=`)

  if (cookie) {
    return decodeURIComponent(cookie.substring(name.length + 1))
  }

  return undefined
}

/**
 * Return the value of the CSRF token sent by the server via cookie.
 *
 * This function reads the public `NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME` environment variable and will
 * throw an Error if the cookie name is not set or if the cookie value cannot be determined.
 */
function getCsrfCookieValue(): string {
  if (!process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME) {
    throw new Error('Client CSRF protection configuration error')
  }

  const csrfToken = getCookie(process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE_NAME)

  if (!csrfToken) {
    throw new Error('Server CSRF protection configuration error')
  }

  return csrfToken
}

/**
 * Fetch wrapper for making requests to the project's back-end API.
 * Includes credentials and sets appropriate headers for Content-Type and CSRF protection.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...(options ?? {}),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(!options?.method || options.method === 'GET' ? {} : { 'CSRF-Token': getCsrfCookieValue() }),
        // alternatively for authorization header, e.g.: 'Authorization': `Bearer ${token}`,
      },
      // required for cors + cookie authentication
      credentials: 'same-origin', // 'include'
    })

    if (response.status === 401) {
      // getApiEvents().emit(EVENT_AUTH_ERROR)

      // return rejected promise vs. throw to bypass catch (enables alternative ux flow in the auth failure case)
      return Promise.reject(new Error('Invalid credentials'))
    }

    // parse responses that are not http-204 (no content) as json
    const json = response.status === 204 ? {} : await response.json()

    if (!json) {
      throw new Error(`Fetch error (${response.status}): missing expected response data from ${path}`)
    }

    // return rejected promise to bypass catch in 400 errors resulting from POST (forms) and throw all other errors
    if (!response.ok) {
      if (options?.method === 'POST' && response.status === 400) {
        if (json?.message) {
          return Promise.reject(new Error(String(json.message)))
        }
        return Promise.reject(new Error('Form submission error'))
      }

      console.error(`Fetch error (${response.status}):`, json)
      throw new Error(`Fetch error!! (${response.status}): ${JSON.stringify(json)}`)
    }

    return json as T
  } catch (error: unknown) {
    // getApiEvents().emit(EVENT_NETWORK_ERROR)

    // return via a rejected promise to provide the error to the calling hook/component
    if (error instanceof Error) {
      return Promise.reject(error)
    }

    return Promise.reject(new Error(String(error)))
  }
}