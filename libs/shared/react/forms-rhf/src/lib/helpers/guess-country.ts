import { getCountriesData } from './data/countries'
import { getTimezonesData } from './data/timezones'

/**
 * Return a rough/approximate guess of a client-side user's country based on the timezone reported by their browser
 * via the `Intl` API.
 *
 * Supports client side use only: will return `undefined` if called on the server.
 *
 * The accuracy of the rough guess is dependent on many factors + externalities including likely-to-be-old and definitely
 * unmaintained data/lists of countries + timezones.
 *
 * In cases where multiple countries share a given timezone, the first country in the matching list is naively returned.
 *
 * This is only suitable for guessing the user's country when setting form defaults, and will perform reasonably well
 * for users in large western countries.
 *
 * For industry-grade/production-grade standards, use an IP geolocation service or exploit IP geolocation capabilities
 * of a cloud provider such as AWS: CloudFront (via request header), WAF, etc to obtain more accurate data.
 *
 * Another option for accurate location is the browser Geolocation API however users will be prompted to provide
 * permission to share their location.
 */
export function guessUserCountryFromBrowserTimezone(options?: { format: 'name' | 'iso' }): string | undefined {
  // handle case if this function is called server-side
  if (typeof window === 'undefined') {
    return undefined
  }

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  if (!browserTimezone) {
    return undefined
  }

  const countries = getCountriesData()
  const timezones = getTimezonesData()

  // guess simply picks the first country when there is an array of multiple countries that share a given tz
  const countryGuess = timezones[browserTimezone]
  const countryGuessIso = Array.isArray(countryGuess?.c) ? countryGuess?.c[0] : undefined

  if (options?.format === 'iso') {
    return countryGuessIso
  }

  return countryGuessIso ? countries[countryGuessIso] : undefined
}
