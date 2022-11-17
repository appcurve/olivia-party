import React from 'react'
import clsx from 'clsx'

import type { FormElementCommonProps } from '../../types/form-element-common-props.interface'

export interface FormInputLabelProps
  extends Omit<React.ComponentPropsWithRef<'label'>, 'className'>,
    Required<Pick<FormElementCommonProps, 'label' | 'hideLabel'>>,
    Pick<FormElementCommonProps, 'appendClassName'> {}

/**
 * Helper input label component that includes a bottom margin. Supports implementation of form input components.
 *
 * Refs are forwarded to underlying label.
 * If the `hideLabel` prop is set the label will be rendered for screen readers only.
 */
export const FormInputLabel = React.forwardRef<HTMLLabelElement, FormInputLabelProps>(function FormInputLabel(
  { htmlFor, label, hideLabel, appendClassName, ...restProps }: FormInputLabelProps,
  forwardedRef,
) {
  return (
    <label
      ref={forwardedRef}
      htmlFor={htmlFor} // explicitly defined vs. spread to confirm; protect from regressions in future revisions to types
      className={clsx('transition-colors duration-100', hideLabel ? 'sr-only' : 'fx-form-label mb-1', appendClassName)}
      {...restProps}
    >
      {label}
    </label>
  )
})
