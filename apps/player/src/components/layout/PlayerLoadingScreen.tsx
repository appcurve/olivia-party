import React from 'react'

import { Spinner } from '@firx/react-feedback'
import { GridLayout } from './GridLayout'

/**
 * Full-screen with centered loading spinner
 */
export const PlayerLoadingScreen: React.FC = () => {
  return (
    <GridLayout>
      <div className="w-full-h-full flex justify-center items-center bg-P-neutral-50">
        <Spinner />
      </div>
    </GridLayout>
  )
}
