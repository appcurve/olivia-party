import React, { useEffect, useRef, useState } from 'react'
import { useSpring, animated, type UseSpringProps } from '@react-spring/web'

/**
 * AnimateOnIntersect component props.
 *
 * Fires only on first appearance unless `infinite` prop is `true`.
 *
 * `IntersectionObserverInit` props `threshold`, `root`, and `rootMargin` are passed to IntersectionObserver:
 * - `threshold` of `0` means that even a single visible pixel is counted as an intersection.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API}
 */
export interface AnimateOnIntersectProps extends IntersectionObserverInit {
  from: UseSpringProps<React.CSSProperties>
  to: UseSpringProps<React.CSSProperties>

  // /** Set to `true` to run the animation and fire `onShow()` (if provided) every intersection vs. only once. */
  // infinite?: boolean

  /** Run animation and fire optional callback only once (default: `true`). */
  runOnce?: boolean

  /** Optional callback to fire on intersection change event. Fires only once unless `infinite` prop is `true`. */
  onIntersectionChange?: (isIntersecting: boolean) => void
}

/**
 * Component that enables animating the appearance of its children using IntersectionObserver and react-spring.
 * Use the `from` and `to` props to specify CSS properties for react-spring to animate.
 */
export const AnimateOnIntersect: React.FC<React.PropsWithChildren<AnimateOnIntersectProps>> = ({
  from,
  to,
  children,
  runOnce = true,
  threshold,
  root,
  rootMargin,
  onIntersectionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState<boolean>(false)

  const props = useSpring(intersected ? to : from)

  useEffect(() => {
    const handleVisibleChange = (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {
      if (entries.length > 0) {
        const entry = entries[0]

        if (intersected && runOnce) {
          return
        }

        setIntersected(entry.isIntersecting)

        if (entry.isIntersecting && runOnce) {
          observer.unobserve(entry.target)
        }

        // if (infinite) {
        //   setIntersected(entry.isIntersecting)
        // } else {
        //   if (entry.intersectionRatio > 0) {
        //     setIntersected(true)
        //     observer.unobserve(entry.target)
        //   }
        // }

        if (typeof onIntersectionChange === 'function') {
          onIntersectionChange(entry.isIntersecting)
        }
      }
    }

    // set default options
    const options: IntersectionObserverInit = {
      root: root || null,
      rootMargin: rootMargin || '0px',
      threshold: threshold || 1.0,
    }

    const observer = new IntersectionObserver(handleVisibleChange, options)

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return function cleanup() {
      observer.disconnect()
    }
  }, [runOnce, intersected, onIntersectionChange, root, rootMargin, threshold])

  return (
    <div ref={containerRef}>
      <animated.div style={props}>{children}</animated.div>
    </div>
  )
}
