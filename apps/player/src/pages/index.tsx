import React from 'react'
import type { NextPage } from 'next'

import { GridLayout } from '../components/layout/GridLayout'
import { FullScreenLayout } from '../components/layout/FullScreenLayout'
import { LandingFallback } from '../components/layout/LandingFallback'

export const IndexPage: NextPage = (_props) => {
  return (
    <GridLayout>
      <FullScreenLayout>
        <div className="text-center">
          <LandingFallback showSpinner={false} />
        </div>
      </FullScreenLayout>
    </GridLayout>
  )
}

export default IndexPage
