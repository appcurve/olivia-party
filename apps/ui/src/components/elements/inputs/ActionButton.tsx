import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

import { Spinner } from '@firx/react-feedback'
import type { ButtonCommonProps } from '../../../types/components/button-common-props.interface'
import type { Themable } from '../../../types/style.types'

export interface ActionButtonProps
  extends ButtonCommonProps,
    Themable,
    Exclude<React.HTMLAttributes<HTMLButtonElement>, 'type' | 'className'> {
  /** HTML button `type`. Explicitly set to protect against cross-browser corner-cases. Default: "button". */
  type?: React.ComponentPropsWithoutRef<'button'>['type']

  height?: 'normal' | 'short'

  /** Optional svg icon as a React function component that renders an `<svg />` element and accepts svg props. */
  SvgIcon?: React.FC<React.ComponentProps<'svg'>>
}

/**
 * Reusable button[type=button] component with a standard set of styles for different variants that matches the
 * look-and-feel of `FormButton` + `LinkButton` components.
 *
 * Intended for standalone buttons with `onClick` or similar event handlers defined.
 *
 * @see FormButton for a button component integrated with react-hook-form.
 * @see LinkButton for a nextjs-compatible anchor (link) styled as a button.
 */
export const ActionButton: React.FC<PropsWithChildren<ActionButtonProps>> = ({
  type,
  scheme,
  height,
  variant,
  border,
  SvgIcon,
  appendClassName,
  disabled,
  isLoading,
  isSubmitting,
  children,
  ...restProps
}) => {
  const renderDisabled = !!disabled || isLoading || isSubmitting

  return (
    <button
      type={type ?? 'button'}
      className={clsx(
        'fx-button-base',
        scheme === 'light' ? 'fx-scheme-light' : 'fx-scheme-dark',
        {
          // conditional animation
          ['animate-pulse']: isLoading || isSubmitting,

          // reduced height (e.g. for navbar, menus)
          'fx-size-short': height === 'short',

          // border style
          ['fx-button-standard-border']: border === 'standard',
          ['fx-button-thin-border']: border === 'thin',

          // button variant styles
          ['fx-button-solid-primary']: variant === 'solid' && !renderDisabled,
          ['fx-button-solid-primary-disabled']: variant === 'solid' && renderDisabled,
          ['fx-button-outline-primary']: variant === 'outline' && !renderDisabled,
          ['fx-button-outline-primary-disabled']: variant === 'outline' && renderDisabled,
          ['fx-button-outline-error']: variant === 'error-outline' && !renderDisabled,
          ['fx-button-outline-error-disabled']: variant === 'error-outline' && renderDisabled,
          ['fx-button-transparent-primary']: variant === 'transparent' && !renderDisabled,
          ['fx-button-transparent-primary-disabled']: variant === 'transparent' && renderDisabled,
        },
        appendClassName,
      )}
      disabled={renderDisabled}
      {...restProps}
    >
      {isLoading || isSubmitting ? (
        <>
          <Spinner size="sm" appendClassName="mr-2" />
          <div className="inline-flex items-center justify-center">{children}</div>
        </>
      ) : (
        <>
          {!!SvgIcon && <SvgIcon className={clsx('w-5 h-5 mr-1 text-white')} aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  )
}

ActionButton.defaultProps = {
  type: 'button',
  variant: 'solid',
  border: 'standard',
}
