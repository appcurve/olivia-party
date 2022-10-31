import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { NextPage } from 'next'
import { useTransition, animated } from '@react-spring/web'

import { useSpeech } from '@firx/react-player-hooks'
import { Spinner } from '@firx/react-feedback'
import { PlayerApp, type PlayerAppProps } from '@firx/op-data-api'

import { usePlayerQuery } from '../api/hooks'
import { useControllerStore } from '../stores/useControllerStore'
import { OpSpeechApp } from '../components/player/OpSpeechApp'
import { OpVideoApp } from '../components/player/OpVideoApp'
import { GridLayout } from '../components/layout/GridLayout'

interface DynamicOliviaPartyAppProps {
  /** Index (position) of the app in the array of apps of this player. */
  index: number

  /** Props of PlayerApp components.  */
  props: PlayerAppProps<PlayerApp>
}

const getAppName = (input: PlayerApp): string => {
  switch (input) {
    case PlayerApp.OpSpeechApp: {
      return 'Speech App'
    }
    case PlayerApp.OpVideoApp: {
      return 'Video Player App'
    }
  }
}

const DynamicOliviaPartyApp: React.FC<DynamicOliviaPartyAppProps> = ({ index: _index, props }) => {
  // console.log('DynamicApp Index', index)

  switch (props.app) {
    case PlayerApp.OpSpeechApp: {
      const playerAppProps: PlayerAppProps<typeof props.app> = props
      return <OpSpeechApp {...playerAppProps} />
    }
    case PlayerApp.OpVideoApp: {
      const playerAppProps: PlayerAppProps<typeof props.app> = props
      return <OpVideoApp {...playerAppProps} />
    }
  }
}

export const DynamicPlayerPage: NextPage = (_props) => {
  const [currentAppIndex, setCurrentAppIndex] = useState<number>(0)

  const speak = useSpeech()
  const controller = useControllerStore((state) => state.controller)

  const { data: playerData, ...playerQuery } = usePlayerQuery()

  const apps = useMemo(() => {
    return playerData?.apps ?? []
  }, [playerData?.apps])

  const handleNextMode = useCallback(() => {
    setCurrentAppIndex((currentIndex) => {
      const nextIndex = (currentIndex + 1) % apps.length

      // @todo double-check the wisdom of calling a (safe-ish) side-effect like speak inside a setState callback...
      // (can be improved later - works for now until a more robust implementation can be made)
      speak(`SWITCH TO ${getAppName(apps[nextIndex].app)}`)

      return nextIndex
    })
  }, [apps, speak])

  useEffect(() => {
    if (controller.altButton) {
      handleNextMode()
    }
  }, [handleNextMode, controller.altButton])

  const transitions = useTransition(currentAppIndex, {
    config: { duration: 500 }, // config.molasses
    from: {
      opacity: 0,
      transform: 'translate3d(-100%, 0px, 0px)',
    },
    enter: { opacity: 1, transform: 'translate3d(0%, 0px, 0px)' },
    leave: { opacity: 0, position: 'absolute', transform: 'translate3d(100%, 0px, 0px)' },
    // delay... onRest: () => ...
  })

  if (playerQuery.isError) {
    return (
      <GridLayout>
        <div className="text-xl text-center">
          <div>Sorry there was an error loading data for your Player</div>
          <div className="text-lg">Do you have the correct Player Code?</div>
        </div>
      </GridLayout>
    )
  }

  return (
    <GridLayout>
      <>
        {playerQuery.isLoading && <Spinner />}
        {playerQuery.isSuccess && !!playerData && (
          <>
            {transitions((styles, index) => (
              <animated.div className="w-full h-full" style={{ ...styles }}>
                <DynamicOliviaPartyApp index={index} props={playerData.apps[index]} />
              </animated.div>
            ))}
          </>
        )}
      </>
    </GridLayout>
  )
}

export default DynamicPlayerPage
