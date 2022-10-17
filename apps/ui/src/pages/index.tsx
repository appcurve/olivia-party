import type { NextPage } from 'next'

import { HeroSection } from '../components/layout/landing/HeroSection'
import { FeatureSection } from '../components/layout/landing/FeatureSection'

export const IndexPage: NextPage = (_props) => {
  return (
    <>
      <HeroSection />
      <FeatureSection />
    </>
  )
}

export default IndexPage
