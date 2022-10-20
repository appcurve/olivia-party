import React, { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import type { DataQueryParams } from '@firx/op-data-api'

export type UseFilterItemsReturnValue<T = object> = [
  searchInputRef: React.MutableRefObject<HTMLInputElement | null>,
  results: T[],
]

/**
 * React hook that implements a basic keyword search filter for arrays of objects with a short debounce (200ms).
 * The hook returns a tuple consisting of a ref to apply to the search input element and a results array.
 *
 * T[keyof T] must be a string or castable to a comparable string using `String()`.
 */
export function useFilterItems<T extends object>(
  key: keyof T,
  items?: T[],
  params?: DataQueryParams<T>,
): UseFilterItemsReturnValue<T> {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<T[]>(() => {
    return items ? [...items] : []
  })

  // stash items in a ref so it can be updated without triggering a re-render
  const itemsRef = useRef<T[]>()
  itemsRef.current = items ?? []

  // eslint-disable-next-line react-hooks/exhaustive-deps -- eslint can't inspect 'debounce' + confirming no deps
  const debouncedSearch = useCallback(
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
    [],
  )

  const handleChange = useCallback(
    (event: Event) => {
      if (event.target instanceof HTMLInputElement && !!itemsRef.current?.length) {
        const term = event.target.value
        debouncedSearch(term, itemsRef.current ?? [], key)
      }
    },
    [debouncedSearch, key],
  )

  // note the difference between the native change event vs. react's synthetic change event
  // the native 'input' event fires when the value changes; native 'change' fires only after the input loses focus
  useEffect(() => {
    const inputElement = searchInputRef.current

    if (inputElement) {
      inputElement?.addEventListener('input', handleChange)
    }

    return () => {
      inputElement?.removeEventListener('input', handleChange)
    }
  }, [debouncedSearch, handleChange])

  // reset results and clear input in case items, key, or first element changes
  useEffect(() => {
    setResults(itemsRef.current ? [...itemsRef.current] : [])

    if (searchInputRef.current?.value) {
      searchInputRef.current.value = ''
    }
  }, [items, key, params])

  return [searchInputRef, results]
}
