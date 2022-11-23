import React, { useEffect, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useIntersectionObserver } from '@react-hookz/web'

export interface CounterAnimationProps {
  fromValue: number
  toValue: number
  runOnce?: boolean
  threshold?: IntersectionObserverInit['threshold']
  fractionDigits?: number
}

/**
 * Counter that animates numerical `fromValue`-`toValue` when the component becomes visible in the viewport.
 * Renders a div containing only the counter value without any styles.
 *
 * Counts in integer increments by default. Set the `fractionDigits` prop to an integer value of 0-20 inclusive
 * to use decimals (e.g. `2` for dollar values).
 *
 * Set the `threshold` prop to configure the underlying IntersectionObserver (default value: 0.25). A value of
 * 0 means a single pixel counts as an intersection. 1 requires the entire component to be in the viewport.
 */
export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  fromValue,
  toValue,
  runOnce = true,
  threshold = 0.25,
  fractionDigits = 0,
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState<boolean>(false)

  // @react-hookz/web currenly only accepts threshold as an array
  const intersection = useIntersectionObserver(elementRef, {
    threshold: Array.isArray(threshold) ? threshold : [threshold],
  })

  const props = useSpring(intersected ? { x: toValue } : { x: fromValue })

  useEffect(() => {
    if (intersected && runOnce) {
      return
    }

    setIntersected(intersection?.isIntersecting ?? false)
  }, [intersection?.isIntersecting, runOnce, intersected])

  if (fractionDigits < 0 || fractionDigits > 20) {
    console.warn('CounterAnimation fractionDigits must be between 0-20 inclusive: aborting render')
    return null
  }

  return (
    <div ref={elementRef}>
      <animated.div>{props.x.to((x) => x.toFixed(fractionDigits))}</animated.div>
    </div>
  )
}
