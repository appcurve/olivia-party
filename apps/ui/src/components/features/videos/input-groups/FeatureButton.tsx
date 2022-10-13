import clsx from 'clsx'

export interface FeatureButtonProps extends Exclude<React.HTMLAttributes<HTMLButtonElement>, 'className'> {
  appendClassName?: string
}

/**
 * Smaller less-emphasized button for use in features.
 * Gray border with primary darker text, with evolved focus styling.
 */
export const FeatureButton: React.FC<React.PropsWithChildren<FeatureButtonProps>> = ({
  appendClassName,
  children,
  ...buttonProps
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'hidden xs:inline-flex items-center px-4 py-2 rounded-md border bg-white',
        'font-medium tracking-tight text-P-primary shadow-sm',
        'fx-focus-ring-form hover:bg-P-neutral-50 hover:border-P-primary/30',
        'border-P-neutral-300 text-sm',
        'transition-colors focus:bg-sky-50 focus:text-P-primary',
        appendClassName,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
