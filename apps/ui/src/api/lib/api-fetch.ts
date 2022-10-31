import { createApiFetchFunction } from '@firx/react-fetch'

/** Base URL of the project's back-end API. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL ?? ''

if (!API_BASE_URL) {
  throw new Error('Invalid API_BASE_URL')
}

const CSRF_TOKEN_COOKIE = process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE
const CSRF_TOKEN_HEADER = process.env.NEXT_PUBLIC_CSRF_TOKEN_HEADER

export const apiFetch = createApiFetchFunction(
  API_BASE_URL,
  CSRF_TOKEN_COOKIE && CSRF_TOKEN_HEADER
    ? {
        csrf: {
          requestHeader: CSRF_TOKEN_HEADER,
          cookieName: CSRF_TOKEN_COOKIE,
        },
      }
    : undefined,
)
