import { ArgumentMetadata, HttpStatus, Injectable, Optional, PipeTransform } from '@nestjs/common'
import { ErrorHttpStatusCode, HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util'
import { isString } from 'class-validator'

// defaults confirmed vs nanoid docs
const DEFAULT_NANOID_ALPHABET = 'A-Za-z0-9_-'
const DEFAULT_NANOID_LENGTH = 21
const DEFAULT_NANOID_REGEXP = /^[A-Za-z0-9_-]{21}$/

// common in the project
const DEFAULT_SHORT_NANOID_REGEXP = /^[A-Za-z0-9_-]{10}$/

export interface ParseNanoidPipeOptions {
  /** Length of nanoid to validate (default: `21` symbols). */
  length?: number

  /** Custom alphabet for this nanoid (default: URL-friendly symbols `A-Za-z0-9_-`). */
  alphabet?: string

  /** Flag to return a vague error message that doesn't give away length or alphabet on error (default `false`). */
  vagueErrorMessage?: boolean

  /** HTTP status code in case of error (default: `BadRequestException`). */
  errorHttpStatusCode?: ErrorHttpStatusCode

  /** Optional exception factory for custom exceptions (functionally the same as NestJS' ParseUuidPipe() option). */
  exceptionFactory?: (errors: string) => unknown
}

/**
 * Custom validation/transform pipe for nanoid's (or similar shortened unique identifiers).
 *
 * Non-default length and alphabet can be specified via options. If a custom alphabet string is provided,
 * character values will be escaped before a new test regex is internally created from the given string.
 *
 * This pipe implementation is based on that of NestJS' built-in `ParseUuidPipe`. The error status code
 * and exception factory options are the same `ParseUuidPipe` for familiarity and consistentency.
 *
 * @see {@link https://github.com/ai/nanoid}
 */
@Injectable()
export class ParseNanoidPipe implements PipeTransform<string> {
  /**
   * Return a copy of the string with special regex characters escaped (e.g. the '.' wildcard)
   * so characters of the input string are treated as literal characters.
   *
   * RegEx copied from reputable source: MDN docs.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping}
   */
  protected escapeRegExpString(input: string): string {
    // note: $& means the whole matched string
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  protected length: number | undefined
  protected alphabet: string | undefined

  protected vagueErrorMessageFlag: boolean
  protected exceptionFactory: (errors: string) => unknown

  constructor(@Optional() options?: ParseNanoidPipeOptions) {
    options = options || {}

    this.length = options.length
    this.alphabet = options.alphabet

    this.vagueErrorMessageFlag = options.vagueErrorMessage ?? false

    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } = options
    this.exceptionFactory = exceptionFactory || ((error): unknown => new HttpErrorByCode[errorHttpStatusCode](error))
  }

  async transform(value: string, _metadata: ArgumentMetadata): Promise<string> {
    if (!this.isNanoid(value, this.length, this.alphabet)) {
      const message = this.vagueErrorMessageFlag
        ? `Invalid nanoid/code`
        : `Validation failed (nanoid/code of length ${this.length} from alphabet '${this.alphabet}' is expected)`
      throw this.exceptionFactory(message)
    }
    return value
  }

  protected isNanoid(input: unknown, length: number | undefined, alphabet: string | undefined): boolean {
    if (!isString(input)) {
      const message = this.vagueErrorMessageFlag
        ? 'Invalid nanoid/code'
        : `Validation failed (nanoid/code is not a string)`
      throw this.exceptionFactory(message)
    }

    if (length === DEFAULT_NANOID_LENGTH && alphabet === DEFAULT_NANOID_ALPHABET) {
      return DEFAULT_NANOID_REGEXP.test(input)
    }

    if (length === 10 && !alphabet) {
      return DEFAULT_SHORT_NANOID_REGEXP.test(input)
    }

    const patternAlphabet = this.alphabet ? this.escapeRegExpString(this.alphabet) : DEFAULT_NANOID_ALPHABET
    const patternLength = this.length || DEFAULT_NANOID_LENGTH

    const patternString = `/^[${patternAlphabet}]{${patternLength}}$/`
    return new RegExp(patternString).test(input)
  }
}
