import React, { useState, useEffect, useRef, useCallback } from 'react'
import create from 'zustand'

import { useTransition, animated } from '@react-spring/web'
import { useSpeech } from '@firx/react-player-hooks'
import { useControllerStore } from '../../stores/useControllerStore'
import ReactPlayerClass from 'react-player' // { type ReactPlayerProps }
// import ReactPlayer from './op-video-app/VideoPlayer'
import dynamic from 'next/dynamic'

// wishful thinking things would Just Work (tm) w/ latest react + nextjs + react-player
// import ReactPlayer from 'react-player'
// import ReactPlayer from 'react-player/lazy'

// notes:
// - react-player/lazy does not support suspense `true` (message: boundary received an update before it finished hydrating)
// - many devs especially w/ nextjs + SSR have had issues with react-player w/ react 18+ (refer to project issues)

// ref methods will not work if next/dynamic import is used unlesss you create a wrapper component and forward ref
// const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false, suspense: false })

const ReactPlayerDynamicImport = dynamic(() => import('react-player/lazy'), {
  ssr: false,
})

export const ReactPlayer = React.forwardRef<ReactPlayerClass>(function VideoPlayer(props, forwardedRef) {
  return <ReactPlayerDynamicImport {...props} ref={forwardedRef} />
})

const episodes = [
  'https://www.youtube.com/watch?v=CDoLM2xCxkM', // masha big hike
  'https://www.youtube.com/watch?v=QndxmRdwAgo', // sesame - Elmo's Furry Red Monster Parade
  'https://www.youtube.com/watch?v=IMDPyqWSupo', // masha summertime happiness
  'https://www.youtube.com/watch?v=3hg1UTjOJ7Q', // woody woodpecker
  'https://www.youtube.com/watch?v=V7Zy5a9nfDg', // sesame - Elmo and Rosita's Musical Playdate
  'https://www.youtube.com/watch?v=GW8I0q-xmIk', // masha sport life
  'https://www.youtube.com/watch?v=AbY2Pjyg5CE', // sesame - find the best pet
  'https://www.youtube.com/watch?v=tEkextPejH8', // peppa - peppa learns how to drive
]

const screens = episodes

interface OpVideoAppState {
  screen: number
  updateScreen: (update: number) => void

  progress: Array<number>
  updateProgress: (update: number) => void
}

const useVideoAppStore = create<OpVideoAppState>((set) => ({
  screen: 0,
  updateScreen: (screen: number): void => {
    set({ screen })
  },

  progress: Array.from({ length: screens.length }, () => 0),
  updateProgress: (latest: number): void => {
    set((state: OpVideoAppState) => {
      const nextProgressState = [...state.progress]
      nextProgressState[state.screen] = latest

      return {
        progress: nextProgressState,
      }
    })
  },
}))

const isClientSide = typeof window !== 'undefined'

// semi-successful hacks to work around shortcomings in react-player + nextjs
// const el = isClientSide && document.getElementById('react-player')?.firstChild
// const playerElement = el ? (el as unknown as ReactPlayerClass) : undefined

/**
 * Cycle through an array of video URL's based on controller up/down inputs.
 *
 * The action button controls play/pause behaviour.
 */
export const OpVideoApp: React.FC = () => {
  const playerRef = useRef<ReactPlayerClass | null>(null)

  const [isPlayMode, setIsPlayMode] = useState<boolean>(false)
  const [transitionDirection, setTransitionDirection] = useState<'UP' | 'DOWN' | undefined>(undefined)

  const [screen, progress, updateScreen, updateProgress] = useVideoAppStore((state) => [
    state.screen,
    state.progress[state.screen],
    state.updateScreen,
    state.updateProgress,
  ])

  const speak = useSpeech()
  const joystick = useControllerStore((state) => state.controller)

  // seekTo() is more reliable when called from player onStart() vs. onReady() callback
  const handlePlayerStarted = (): void => {
    if (progress > 0) {
      // the addition of the if statement is a workaround
      if (typeof playerRef.current?.seekTo === 'function') {
        playerRef.current?.seekTo(progress)
      }
    }
  }

  // JSX.LibraryManagedAttributes<typeof YouTubePlayer, YouTubePlayer['props']['onProgress']>
  const handleProgressUpdate = (playedSeconds: number): void => {
    if (playedSeconds) {
      updateProgress(playedSeconds)
    }
  }

  // a ref callback within YouTubePlayer prevents playerRef.current from becoming null.
  // this enables reliable playerRef.current.getCurrentTime() calls to save the current playback
  // time of an outgoing screen even with transitions.
  const handlePlayerRef = useCallback((node: ReactPlayerClass | null) => {
    if (node) {
      playerRef.current = node
    }
  }, [])

  // handle joystick actions (@todo needs refactor + accommodate exhaustive deps linter - OpVideoApp)
  useEffect(() => {
    if (joystick.button) {
      speak(isPlayMode ? 'PAUSE' : 'PLAY')
      setIsPlayMode(!isPlayMode)
    }

    if (joystick.up || joystick.down) {
      // OG worked fine but now broken w/ react 18+ nextjs and latest react-player
      // const currTime = playerRef.current?.getCurrentTime()

      // hack fix
      const currTime = typeof playerRef.current?.getCurrentTime === 'function' ? playerRef.current?.getCurrentTime() : 0

      if (currTime) {
        console.log('setting currtime to ', currTime)
        updateProgress(currTime)
      }
    }

    if (joystick.up) {
      speak('UP')
      setTransitionDirection('UP')
      updateScreen((screen + 1) % screens.length)
    }

    if (joystick.down) {
      speak('DOWN')
      setTransitionDirection('DOWN')
      updateScreen((screen - 1 + screens.length) % screens.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- @temp @todo refactor this effect
  }, [joystick.button, joystick.up, joystick.down])

  // @future video app save screen progress on component unmount (when parent mode changes)
  // @see https://reactjs.org/blog/2020/08/10/react-v17-rc.html#effect-cleanup-timing
  // possibly with getCurrentTime() in a cleanup of a useEffect ??

  const transitions = useTransition(screen, {
    config: { duration: 500 },
    from: {
      opacity: 0,
      transform: `translate3d(0px, ${transitionDirection === 'UP' ? '100%' : '-100%'}, 0px)`,
    },
    enter: {
      opacity: 1,
      transform: 'translate3d(0px, 0%, 0px)',
      // onRest: handlePlayerStarted,
    },
    leave: {
      opacity: 0,
      position: 'absolute',
      transform: `translate3d(0px, ${transitionDirection === 'UP' ? '-100%' : '100%'}, 0px)`,
    },
  })

  return (
    <>
      {transitions((styles, screenIndex) => {
        console.log(
          `fuckery with screens of length ${screens.length} and screenIndex ${screenIndex}`,
          screens[screenIndex],
        )

        return (
          <animated.div className="w-full h-full pointer-events-none" style={{ ...styles }}>
            {isClientSide ? (
              <ReactPlayer
                ref={handlePlayerRef}
                // @ts-expect-error react-player is crap and nextjs wastes almost as much time as it saves
                url={screens[screenIndex]}
                playing={isPlayMode}
                width="100%"
                height="100%"
                progressInterval={1000}
                // if importing from react-player/youtube then only the innermost object should be passed to config
                config={{
                  youtube: {
                    playerVars: {
                      controls: 0,
                      disablekb: true,
                      cc_lang_pref: 'en',
                    },
                  },
                }}
                onStart={handlePlayerStarted}
                // @ts-expect-error react-player is crap and nextjs wastes almost as much time as it saves
                onProgress={({ playedSeconds }): void => handleProgressUpdate(playedSeconds)}
              />
            ) : (
              <></>
            )}
          </animated.div>
        )
      })}
    </>
  )
}
