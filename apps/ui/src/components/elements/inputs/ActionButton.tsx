import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

import { Spinner } from '@firx/react-feedback'
import type { ButtonCommonProps } from '../../../types/components/button-common-props.interface'
import type { Themable } from '../../../types/style.types'

export interface ActionButtonProps
  extends ButtonCommonProps,
    Themable,
    Exclude<React.HTMLAttributes<HTMLButtonElement>, 'type' | 'className'> {
  /**
   * Button `type` is explicitly included and required to protect against corner-case differences across browsers.
   * ActionButton default type is "button".
   */
  type?: React.ComponentPropsWithoutRef<'button'>['type']
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
  variant,
  border,
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

          // border style
          ['fx-button-standard-border']: border === 'standard',
          ['fx-button-thin-border']: border === 'thin',

          // button variant styles
          ['fx-button-solid-primary']: variant === 'solid' && !renderDisabled,
          ['fx-button-solid-primary-disabled']: variant === 'solid' && renderDisabled,
          ['fx-button-outline-primary']: variant === 'outline' && !renderDisabled,
          ['fx-button-outline-primary-disabled']: variant === 'outline' && renderDisabled,
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
        <>{children}</>
      )}
    </button>
  )
}

ActionButton.defaultProps = {
  type: 'button',
  variant: 'solid',
  border: 'standard',
}
