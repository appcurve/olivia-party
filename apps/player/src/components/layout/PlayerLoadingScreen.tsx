import React from 'react'

import { GridLayout } from './GridLayout'
import { FullScreenLayout } from './FullScreenLayout'
import { LandingFallback } from './LandingFallback'

/**
 * Full-screen with centered loading spinner
 */
export const PlayerLoadingScreen: React.FC = () => {
  return (
    <GridLayout>
      <FullScreenLayout>
        <LandingFallback showSpinner={true} />
      </FullScreenLayout>
    </GridLayout>
  )
}
