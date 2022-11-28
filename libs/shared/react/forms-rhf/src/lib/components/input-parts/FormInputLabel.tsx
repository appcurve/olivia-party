import React from 'react'
import clsx from 'clsx'

import type { FormElementCommonProps } from '../../types/form-element-common-props.interface'

export interface FormInputLabelProps
  extends Omit<React.ComponentPropsWithRef<'label'>, 'className'>,
    Required<Pick<FormElementCommonProps, 'label' | 'showLabel'>>,
    Pick<FormElementCommonProps, 'appendClassName'> {}

/**
 * Helper input label component that forwards refs intended to support comprehensive form input components.
 * Will render with visibility only for screen-readers when `showLabel` is `false`.
 */
export const FormInputLabel = React.forwardRef<HTMLLabelElement, FormInputLabelProps>(function FormInputLabel(
  { htmlFor, label, showLabel, appendClassName, ...restProps }: FormInputLabelProps,
  forwardedRef,
) {
  return (
    <label
      ref={forwardedRef}
      htmlFor={htmlFor} // explicitly set for regression safety
      className={clsx('transition-colors duration-100', showLabel ? 'sr-only' : 'fx-form-label', appendClassName)}
      {...restProps}
    >
      {label}
    </label>
  )
})
