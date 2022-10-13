import clsx from 'clsx'
import Link from 'next/link'

import { FaGithub } from 'react-icons/fa'
import type { Themable } from '../../../../types/style.types'

export interface GitHubLinkProps extends Themable {}

const LABELS = {
  A11Y_GO_TO_GITHUB: 'Go to Project GitHub Repository',
}

export const GitHubLink: React.FC<GitHubLinkProps> = ({ scheme }) => {
  return (
    <Link href={process.env.NEXT_PUBLIC_PROJECT_ORG_GITHUB_URL ?? ''}>
      <a
        className={clsx('inline-flex items-center p-2 rounded-md fx-focus-highlight transition', {
          'hover:bg-white/10 focus:bg-white/10 text-P-link-light hover:text-P-link-light-hover': scheme === 'light',
          'hover:bg-white/75 text-P-primary hover:text-P-primary-hover': scheme === 'dark',
        })}
      >
        <span className="sr-only">{LABELS.A11Y_GO_TO_GITHUB}</span>
        <FaGithub className="h-6 w-6" aria-hidden="true" />
      </a>
    </Link>
  )
}
