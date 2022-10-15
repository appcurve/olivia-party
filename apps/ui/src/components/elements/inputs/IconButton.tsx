import React from 'react'
import clsx from 'clsx'
import type { Themable } from '../../../types/style.types'

export interface IconButtonProps
  extends Exclude<React.ComponentPropsWithRef<'button'>, 'type' | 'className'>,
    Themable {
  /**
   * Set labels for screenreaders.
   */
  a11y?: {
    label?: string
  }

  /**
   * Optional caption/label to render beside the icon in thin all-caps (e.g. "Menu").
   */
  caption?: string

  /**
   * React function component representation of an `<svg>...</svg>` icon.
   */
  SvgIcon: React.FC<React.ComponentProps<'svg'>>

  appendClassName?: string
  appendIconClassName?: string
}

// note custom tailwindcss utilities for menus/menu-buttons/etc are added by plugin `@headlessui/tailwindcss`, e.g.:
// 'ui-open:bg-sky-50 ui-open:text-slate-400',
// 'ui-open:outline-none ui-open:border-slate-300 ui-open:ring-2 ui-open:ring-sky-100',

/**
 * Button that renders with the provided `SvgIcon` inside and using palette consistent with project look-and-feel.
 * Intended for icon buttons that toggle menus, options, etc.
 *
 * The optional `appendClassName` and `appendIconClassName` props are respectively applied to the parent button
 * element and the svg icon. These are intended for setting custom margins + spacing vs. palette; take care to avoid
 * style/class conflicts.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { scheme, caption, SvgIcon, a11y, appendClassName, appendIconClassName, ...restButtonProps },
  forwardedRef,
) {
  return (
    <button
      ref={forwardedRef}
      type="button"
      className={clsx(
        'group flex items-center p-2 border rounded-md',
        'fx-button-solid-primary',
        scheme === 'light' ? 'fx-scheme-light' : 'fx-scheme-dark',
        appendClassName,
      )}
      {...restButtonProps}
    >
      {!!a11y?.label && <span className="sr-only">{a11y.label}</span>}
      {!!caption && <span className="inner-block px-2 leading-none uppercase text-sm font-medium">{caption}</span>}
      <SvgIcon
        className={clsx(
          'w-5 h-5 transition-colors',
          scheme === 'light'
            ? 'group-hover:text-P-primary-hover group-focus:text-P-primary-hover'
            : 'group-hover:text-white group-focus:text-white',
          {
            ['mr-2']: !!caption,
          },
          appendIconClassName,
        )}
        aria-hidden="true"
      />
    </button>
  )
})
