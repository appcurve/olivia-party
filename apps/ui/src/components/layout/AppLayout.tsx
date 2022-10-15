import type { PropsWithChildren } from 'react'

import { Header } from './sections/Header'
import { Footer } from './sections/Footer'

import type { NavigationLink } from '../../types/navigation.types'

export interface AppLayoutProps {
  navigationLinks: NavigationLink[]
}

/**
 * Responsive web application UI layout that includes a header with responsive navigation, a main content section,
 * and a footer.
 */
export const AppLayout: React.FC<PropsWithChildren<AppLayoutProps>> = ({ navigationLinks, children }) => {
  return (
    <div className="h-screen z-0 flex flex-col">
      <Header navigationLinks={navigationLinks} />
      <main className="flex-1 w-full mx-auto bg-white sm:bg-P-neutral-100">{children}</main>
      <Footer />
    </div>
  )
}
