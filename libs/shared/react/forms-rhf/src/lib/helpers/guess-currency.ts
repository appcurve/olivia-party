import getCurrenciesData from './data/currencies'

/**
 * Return a rough/approximate guess of a currency based on the given country or `undefined` if no match is found.
 *
 * The accuracy of the rough guess is dependent on many factors + externalities including likely-to-be-old and definitely
 * unmaintained local data. Works well enough for major countries at the time of writing.
 *
 * For industry-grade/production-grade standards, use an IP geolocation service or similar service that includes
 * currency data in its results.
 */
export function guessUserCurrencyFromCountry(countryIso?: string): string | undefined {
  return countryIso ? getCurrenciesData()[countryIso] : undefined
}
