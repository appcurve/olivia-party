import clsx from 'clsx'

export interface FormInputHelperTextProps {
  /** Text to display. The component will not render if this value is falsey. */
  text: string | undefined

  /** Text size 'xs' or 'sm'. Default: 'sm'. */
  size?: 'xs' | 'sm'
}

/**
 * Helper text component to be used in the implementation of form input components.
 * Does not render if the provided `text` is falsey.
 */
export const FormInputHelperText: React.FC<FormInputHelperTextProps> = ({ text, size = 'sm' }) => {
  return text ? (
    <div
      className={clsx(
        'text-left pl-0.5 pt-1 text-P-form-helper-text font-normal group-focus-within:text-P-form-helper-text-focus',
        {
          ['text-xs']: size === 'xs',
          ['text-sm']: size === 'sm',
        },
      )}
    >
      {text}
    </div>
  ) : null
}
