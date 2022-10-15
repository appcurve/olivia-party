import { ProseLayout, type ProseLayoutProps } from './page-layouts/ProseLayout'

export interface PageLayout {
  Prose: React.FC<React.PropsWithChildren<ProseLayoutProps>>
}

export const PageLayout: PageLayout = Object.assign(
  {},
  {
    Prose: ProseLayout,
  },
)
