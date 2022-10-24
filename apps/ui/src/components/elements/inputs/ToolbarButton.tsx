import React from 'react'
import clsx from 'clsx'

export interface ToolbarButtonProps extends Exclude<React.ComponentPropsWithRef<'button'>, 'type' | 'className'> {
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

/**
 * Icon Button for secondary applications including toolbars, options or menu toggles of items in lists or
 * table rows, etc.
 *
 * Renders with a light color scheme and the `SvgIcon` provided via props.
 *
 * The optional `appendClassName` and `appendIconClassName` props are respectively applied to the parent button
 * element and the svg icon. These are intended for setting custom margins + spacing vs. palette colors; take care
 * to avoid style/class conflicts.
 *
 * Consider an `IconButton` for primary cases such as main navigation.
 *
 * @see IconButton
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { caption, disabled, SvgIcon, a11y, appendClassName, appendIconClassName, ...restButtonProps },
  forwardedRef,
) {
  return (
    <button
      ref={forwardedRef}
      type="button"
      disabled={disabled}
      className={clsx(
        'group flex items-center p-2 border rounded-md transition-colors duration-150',
        'text-sm text-P-neutral-400',
        'border-P-neutral-300 hover:border-P-neutral-300',
        'fx-focus-ring-form', // hover:bg-P-neutral-50
        'bg-white focus:shadow-sm hover:shadow-sm',
        {
          ['hover:text-P-primary-hover focus:text-P-primary focus:bg-P-focus-light hover:bg-P-focus-light']: !disabled,
          ['opacity-75 pointer-events-none bg-P-neutral-50']: disabled,
        },
        appendClassName,
      )}
      {...restButtonProps}
    >
      {!!a11y?.label && <span className="sr-only">{a11y.label}</span>}
      {!!caption && (
        <span
          className={clsx(
            'inner-block px-2 leading-none uppercase text-xs font-medium text-P-neutral-500',
            'group-hover:text-P-primary-hover group-focus:text-P-primary-hover',
          )}
        >
          {caption}
        </span>
      )}
      <SvgIcon
        className={clsx(
          'w-5 h-5',
          {
            ['mr-2']: !!caption,
            // ['text-P-neutral-700']: variant === 'primary',
            // ['text-P-neutral-400']: variant === 'secondary',
          },
          appendIconClassName,
        )}
        aria-hidden="true"
      />
    </button>
  )
})
