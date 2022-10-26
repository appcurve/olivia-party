import React from 'react'

import { Spinner } from '@firx/react-feedback'
import { GridLayout } from './GridLayout'
import { FullScreenLayout } from './FullScreenLayout'

/**
 * Full-screen with centered loading spinner
 */
export const PlayerLoadingScreen: React.FC = () => {
  return (
    <GridLayout>
      <FullScreenLayout>
        <Spinner />
      </FullScreenLayout>
    </GridLayout>
  )
}
