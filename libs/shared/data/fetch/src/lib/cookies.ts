/**
 * Return the string value of a cookie with the given `name`, or `undefined` if the cookie does not exist,
 * cannot be read, or has a falsey value.
 *
 * Cookies must be readable by client JS to be returned by this function, e.g. they cannot be HttpOnly cookies
 * or those that have a SameSite attribute that differs from the project URL.
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
 * Return the value of a CSRF token cookie with the given `name`, where the cookie is set by an API server
 * that implements the stateless _Double Submit Cookie Pattern_.
 *
 * This function will throw an Error if the cookie name is empty is a nullish value in case one slips through
 * at runtime.
 */
export function getCsrfCookieValue(name: string): string {
  if (!name) {
    throw new Error('Client CSRF protection configuration error')
  }

  const csrfToken = getCookie(name)

  if (!csrfToken) {
    throw new Error('Server CSRF protection configuration error')
  }

  return csrfToken
}
