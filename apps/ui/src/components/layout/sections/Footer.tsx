import clsx from 'clsx'
import { HeartIcon } from '@heroicons/react/20/solid'
import { NavLink } from '../../elements/inputs/NavLink'

export interface FooterProps {}

const footerClassName = clsx(
  'flex flex-col xs:flex-row items-center justify-center w-full mx-auto text-center py-2 xs:py-4',
  'text-xs font-normal leading-none text-P-neutral-200',
  'fx-layout-max-width fx-layout-padding-x',
)

/**
 * Footer for structure layout.
 */
export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="border-t text-P-neutral-300 bg-P-background-contrast-bright border-P-background-contrast-bright-hover">
      <div className={footerClassName}>
        <span>&copy; {new Date().getFullYear()} </span>
        <HeartIcon className="h-3 w-3 mx-1 my-0.5" />
        {process.env.NEXT_PUBLIC_PROJECT_ORG_CONTACT_URL && process.env.NEXT_PUBLIC_PROJECT_ORG_NAME && (
          <div>
            <NavLink href={process.env.NEXT_PUBLIC_PROJECT_ORG_CONTACT_URL}>
              {process.env.NEXT_PUBLIC_PROJECT_ORG_NAME}
            </NavLink>
          </div>
        )}
      </div>
    </footer>
  )
}
