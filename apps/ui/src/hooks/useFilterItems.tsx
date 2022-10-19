import React, { useCallback, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'

export type UseFilterItemsReturnValue<T = object> = [
  searchInputRef: React.MutableRefObject<HTMLInputElement | null>,
  results: T[],
]

/**
 * React hook that implements a basic keyword search filter for arrays of objects with a short debounce (200ms)
 * The hook returns a tuple consisting of a ref to apply to the search input element and a results array.
 */
export function useFilterItems<T extends object>(key: keyof T, items: T[]): UseFilterItemsReturnValue<T> {
  // note the difference with native change events vs. react change event (synthetic event)
  // the native 'input' event fires when the input changes ('change' only fires when input loses focus)

  const [results, setResults] = useState<T[]>(items)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- eslint can't inspect 'debounce' + confirming no deps
  const debouncedSearch = useCallback(
    debounce((term: string, items: T[], key: keyof T) => {
      if (term === '') {
        setResults(items)
      }

      setResults(
        items.filter((item) =>
          String(item[key]).replace(/\s+/g, '').toLowerCase().includes(term.replace(/\s+/g, '').toLowerCase()),
        ),
      )
    }, 200),
    [],
  )

  const handleChange = useCallback(
    (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        const term = event.target.value
        debouncedSearch(term, items, key)
      }
    },
    [debouncedSearch, items, key],
  )

  useEffect(() => {
    const inputElement = searchInputRef.current

    if (inputElement) {
      inputElement?.addEventListener('input', handleChange)
    }

    return () => {
      inputElement?.removeEventListener('input', handleChange)
    }
  }, [debouncedSearch, handleChange])

  // reset results + clear input in case of initial render and when items or key change
  useEffect(() => {
    setResults(items)

    if (searchInputRef.current?.value) {
      searchInputRef.current.value = ''
    }
  }, [items, items.length, key])

  return [searchInputRef, results]
}
