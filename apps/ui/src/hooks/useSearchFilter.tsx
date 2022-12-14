import React, { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import type { DataQueryParams } from '@firx/op-data-api'

export type UseSearchFilterReturnValue<T = object> = [
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  results: T[],
  searchInputRef: React.MutableRefObject<HTMLInputElement | null>,
]

/**
 * React hook that implements a basic keyword search filter for arrays of objects with a short debounce (200ms)
 * to help the invoking component limit the number of re-renders.
 *
 * The given `items` are assumed to be a stable reference in cases where the array's contents do not change.
 *
 * If the ref that's included in the tuple returned by this hook is applied to the search input, the case will
 * be handled where the search input is mounted with a non-empty value.
 *
 * @param key values of this property will be searched for substring matches
 * @param items array of like objects that contain the property `key`
 * @returns returns a tuple containing: onChange handler, results array, ref to apply to input.
 */
export function useSearchFilter<T extends object>(
  key: keyof T,
  items: T[],
  params?: DataQueryParams<T>,
): UseSearchFilterReturnValue<T> {
  const [results, setResults] = useState<T[]>(items)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // stash items in a ref so it can be updated without triggering a re-render
  const itemsRef = useRef<T[]>(items)
  itemsRef.current = items

  // stable debounce search filter function
  const debouncedSearch = useRef(
    debounce((term: string, searchItems: T[], key: keyof T) => {
      if (term === '') {
        setResults([...searchItems])
      } else {
        setResults(
          searchItems.filter((item) =>
            String(item[key]).replace(/\s+/g, '').toLowerCase().includes(term.replace(/\s+/g, '').toLowerCase()),
          ),
        )
      }
    }, 200),
  ).current

  // handle case where items reference or length, and/or key change
  useEffect(() => {
    setResults([...itemsRef.current])

    if (searchInputRef.current) {
      debouncedSearch(searchInputRef.current.value, itemsRef.current, key)
    }
  }, [debouncedSearch, items, key, params])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      debouncedSearch(event.target.value, items, key)
    },
    [debouncedSearch, items, key],
  )

  return [handleSearchInputChange, results, searchInputRef]
}
