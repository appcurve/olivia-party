import type { NextPage } from 'next'

import { HeroSection } from '../components/layout/landing/HeroSection'
import { FeatureSection } from '../components/layout/landing/FeatureSection'
import { NewSection } from '../components/layout/landing/NewSection'
import { FaqSection } from '../components/layout/landing/FaqSection'
import { ExplainSection } from '../components/layout/landing/ExplainSection'
import { ImageCopySection } from '../components/layout/landing/ImageCopySection'
import { OverviewSection } from '../components/layout/landing/OverviewSection'

export const IndexPage: NextPage = (_props) => {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <OverviewSection />
      {/* <ImageCopySection />
      <ExplainSection />
      <NewSection /> */}
      {/* <FaqSection /> */}
    </>
  )
}

export default IndexPage
