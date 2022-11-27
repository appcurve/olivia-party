import clsx from 'clsx'
import React from 'react'

export interface FormContainerProps {
  appendClassName?: string
}

/**
 * Responsive container for forms: handles max width, centering, and adding consistent vertical spacing
 * between its children.
 */
export const FormContainer: React.FC<React.PropsWithChildren<FormContainerProps>> = ({ appendClassName, children }) => {
  return <div className={clsx('w-full sm:w-4/6 mx-auto space-y-4', appendClassName)}>{children}</div>
}
