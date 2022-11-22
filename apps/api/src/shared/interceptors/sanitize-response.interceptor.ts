import { isRecord } from '@firx/ts-guards'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { map, Observable } from 'rxjs'

const DEFAULT_PROPERTY_NAMES_BLACKLIST = ['password', 'refreshTokenHash']

/**
 * Interceptor to sanitize given property names from the bodies of responses that are objects or arrays.
 *
 * The value of sanitized properties is set to `undefined` [or should they be `delete`'d]
 *
 * This interceptor is intended as an extra layer of defence to protect against the API leaking sensitive data in
 * scenarios where the performance hit caused by additional processing is acceptable for improved security.
 *
 * @todo part of SanitizeResponseInterceptor was grabbed from a crappy implementation and should be rewritten
 *       also needs to respect Dates vs. clobbering them to empty objects in the response
 */
@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
  // private exclusions: Set<string>

  constructor(private excludePropertyNames: string[] = DEFAULT_PROPERTY_NAMES_BLACKLIST) {
    // this.exclusions = new Set(excludePropertyNames)
  }

  // dates
  private sanitizeResponseValues(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(this.sanitizeResponseValues)
    }

    if (isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => {
          if (this.excludePropertyNames.includes(k)) {
            return [k, undefined]
          }

          if (Array.isArray(v) || isRecord(v)) {
            return [k, this.sanitizeResponseValues(v)]
          }

          return [k, v]
        }),
      )
    }

    return value
  }

  // private sanitize(input: )

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((value) => this.sanitizeResponseValues(value)))
  }
}
