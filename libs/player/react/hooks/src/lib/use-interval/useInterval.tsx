import { useEffect, useRef } from 'react'

/**
 * React hook that repeatedly and indefinitely calls the given callback function at the
 * interval specified by `delay`.
 *
 * The interval is cleared when the invoking component unmounts (via useEffect() cleanup).
 */
export const useInterval = (callback: () => unknown, delay: number): void => {
  const callbackRef = useRef<() => unknown>()

  // save the latest callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // set interval
  useEffect(() => {
    // const cb = callbackRef.current
    const tick = (): void => {
      if (callbackRef.current && typeof callbackRef.current === 'function') {
        callbackRef.current()
      }
    }

    if (delay !== null && delay !== undefined) {
      const id = setInterval(tick, delay)

      return (): void => {
        callbackRef.current = undefined
        clearInterval(id)
      }
    }

    return
  }, [delay])
}
