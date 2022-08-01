import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { Spinner } from '../elements/Spinner'

export interface FormButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** button `type` is explicitly required to protect against corner-cases. */
  type: React.ComponentPropsWithoutRef<'button'>['type']
}

/**
 * Form button component for use with react-hook-form.
 *
 * An explicit `type`
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 */
export const FormButton: React.FC<FormButtonProps> = ({ children, ...props }) => {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  const isDisabled = (props.disabled ?? false) || isSubmitting

  return (
    <button
      className={clsx('inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-700 text-white', {
        'animate-pulse': isSubmitting,
      })}
      disabled={isDisabled}
    >
      {isSubmitting && <Spinner size="sm" appendClassName="mr-1" />}
      {children}
    </button>
  )
}
