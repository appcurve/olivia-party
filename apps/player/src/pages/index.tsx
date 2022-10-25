import React, { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import { useTransition, animated } from '@react-spring/web'

import { useSpeech } from '@firx/react-player-hooks'
import { useControllerStore } from '../stores/useControllerStore'
import { OpSpeechApp } from '../components/player/OpSpeechApp'
import { OpVideoApp } from '../components/player/OpVideoApp'
import { GridLayout } from '../components/layout/GridLayout'

const partyApps = [
  { name: 'Video App', component: OpVideoApp },
  { name: 'Speech App', component: OpSpeechApp },
]

const OliviaPartyApp: React.FC<{ index: number }> = ({ index }) => {
  return partyApps[index].component({})
}

export const IndexPage: NextPage = (_props) => {
  const [currentAppIndex, setCurrentAppIndex] = useState<number>(0)

  const speak = useSpeech()
  const controller = useControllerStore((state) => state.controller)

  const handleNextMode = useCallback(() => {
    setCurrentAppIndex((currentIndex) => {
      const nextIndex = (currentIndex + 1) % partyApps.length

      // @todo double-check the wisdom of calling speak here inside a setState callback
      speak(`SWITCH APP TO ${partyApps[nextIndex].name}`)

      return nextIndex
    })
  }, [speak])

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
    // delay...
    // onRest: () => ...
  })

  return (
    <GridLayout>
      {transitions((styles, index) => (
        <animated.div className="w-full h-full" style={{ ...styles }}>
          <OliviaPartyApp index={index} />
        </animated.div>
      ))}
    </GridLayout>
  )
}

export const TempPage: React.FC = () => {
  const [currentAppIndex, setCurrentAppIndex] = useState<number>(0)

  const speak = useSpeech()
  const controller = useControllerStore((state) => state.controller)

  const handleNextMode = useCallback(() => {
    setCurrentAppIndex((currentIndex) => {
      const nextIndex = (currentIndex + 1) % partyApps.length

      // @todo double-check the wisdom of calling speak here inside a setState callback
      speak(`SWITCH TO ${partyApps[nextIndex].name}`)

      return nextIndex
    })
  }, [speak])

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
    // delay...
    // onRest: () => ...
  })

  return (
    <GridLayout>
      {transitions((styles, index) => (
        <animated.div className="w-full h-full" style={{ ...styles }}>
          <OliviaPartyApp index={index} />
        </animated.div>
      ))}
    </GridLayout>
  )

  return (
    <div>
      Hello World
      <button type="button" onClick={(): void => speak('hello')}>
        Click Me
      </button>
    </div>
  )
}

// export default IndexPage
export default TempPage
