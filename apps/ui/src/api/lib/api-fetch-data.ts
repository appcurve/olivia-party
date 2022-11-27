import { ApiFetchConfig, createApiFetchFunction } from '@firx/react-fetch'
import { API_BASE_URL } from '../constants/urls'

if (!API_BASE_URL) {
  throw new Error('Invalid API_BASE_URL')
}

const CSRF_TOKEN_COOKIE = process.env.NEXT_PUBLIC_CSRF_TOKEN_COOKIE
const CSRF_TOKEN_HEADER = process.env.NEXT_PUBLIC_CSRF_TOKEN_HEADER

const fetchConfig: ApiFetchConfig | undefined =
  CSRF_TOKEN_COOKIE && CSRF_TOKEN_HEADER
    ? {
        csrf: {
          requestHeader: CSRF_TOKEN_HEADER,
          cookieName: CSRF_TOKEN_COOKIE,
        },
      }
    : undefined

export const apiFetchData = createApiFetchFunction(API_BASE_URL, fetchConfig)
