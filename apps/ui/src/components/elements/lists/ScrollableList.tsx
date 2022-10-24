import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMergedRef } from '@firx/react-hooks'

export interface ScrollableListProps extends Omit<React.ComponentPropsWithRef<'ul'>, 'className'> {
  minHeightViewport?: number
  maxHeightViewport?: number
  appendClassName?: 'string'
}

/**
 * Scrollable list as a styled `ul` with a custom scrollbar that appears conditionally per overflow-y 'auto'.
 *
 * Styled with a rounded border that coordinates with project form elements to support forms with field arrays
 * and lists of complex/interactive items.
 *
 * Custom min + max heights can be provided via `minHeightViewport` + `maxHeightViewport` props as numbers in
 * viewport height (vh) units. They are applied directory to the list via `style` prop. Default max height `30` vh
 * and no min height.
 *
 * Forwards `ref` and any other `ul` props except `className` + `style` to the underlying `ul` (styling props are
 * reserved by the component implementation).
 *
 * The `appendClassName` prop supports adding class names for positioning + margins vs. overriding look-and-feel.
 *
 * @todo refactor out the element scrollbar detection into a reusable custom hook
 */
export const ScrollableList = React.forwardRef<HTMLUListElement, ScrollableListProps>(function ScrollableList(
  { children, minHeightViewport, maxHeightViewport, appendClassName, ...restProps }: ScrollableListProps,
  forwardedRef,
) {
  const [hasScrollbar, setHasScrollbar] = useState<boolean | null>(null)

  const listRef = useRef<HTMLUListElement>(null)
  const mergedRef = useMergedRef(forwardedRef, listRef)

  useEffect(() => {
    function update(): void {
      const element = listRef.current

      if (element) {
        setHasScrollbar(element.scrollHeight > element.clientHeight)
      }
    }

    update()

    window.addEventListener('resize', update)
    return (): void => window.removeEventListener('resize', update)
  }, [])

  // note: max heights are set as an inline style as tailwind purge may not be compatible with
  // string interpolation within tailwind utilities e.g. interpolating a number in `max-h-[30vh]`

  const inlineStyle = {
    maxHeight: `${maxHeightViewport ?? 30}vh`,
    ...(minHeightViewport ? { minHeight: `${minHeightViewport}vh` } : {}),
  }

  return (
    <ul
      ref={mergedRef}
      className={clsx(
        'grid grid-cols-1 gap-2 py-2 rounded-md',
        'fx-scrollbar overflow-y-auto',
        'border-P-neutral-300 border',
        {
          ['pl-2 pr-0.5']: hasScrollbar,
          ['px-2']: !hasScrollbar,
        },
        appendClassName,
      )}
      style={inlineStyle}
      {...restProps}
    >
      {children}
    </ul>
  )
})
