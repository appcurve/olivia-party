import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactPlayer from 'react-player'
import create from 'zustand'
import { useTransition, animated } from '@react-spring/web'

import { useSpeech } from '@firx/react-player-hooks'
import { PlayerApp, VideoGroupDto, VideoPlatform, type PlayerAppProps } from '@firx/op-data-api'
import { useControllerStore } from '../../stores/useControllerStore'

// dev notes:
// wishful thinking things would Just Work (tm) w/ latest react + nextjs + react-player vs. the hardware+React PoC
// import ReactPlayer from 'react-player'
// import ReactPlayer from 'react-player/lazy'

// notes:
// - react-player/lazy does not support suspense `true` (message: boundary received an update before it finished hydrating)
// - many devs especially w/ nextjs + SSR have had issues with react-player w/ react 18+ (refer to project issues)
// - ref methods will not work if next/dynamic import is used unlesss (reportedly) you create a wrapper component and forward ref
//   however I tried several different approaches and none coud consistently get the effect
//
// - importantly note refs can work/behave differently re class vs. functional components

// @temp for dev/demo purposes fallback to a dummy video list
// @future REMOVE and have elegant handling of no-content case and have a separate demo deploy
const dummyVideoGroupDtoVideos: VideoGroupDto['videos'] = [
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    externalId: 'N33ldfKwdLs',
    name: 'Example Video 1',
    platform: VideoPlatform.YOUTUBE,
    groups: [],
    uuid: 'abcd-1234',
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    externalId: 'ONvNWclIes4',
    name: 'Example Video 2',
    platform: VideoPlatform.YOUTUBE,
    groups: [],
    uuid: 'efgh-1234',
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    externalId: 'kuKKn8fWirc',
    name: 'Example Video 3',
    platform: VideoPlatform.YOUTUBE,
    groups: [],
    uuid: 'ijkl-1234',
  },
]

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

  // @todo if/when video progress can get saved again maybe just use an object or map w/ key as video embed id
  // note -- OG that worked w/ hardcode screens: progress: Array.from({ length: screens.length }, () => 0),
  progress: Array.from({ length: 50 }, () => 0), // @temp hardcoded 50 for now @future could set to max per playlist

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

// semi-successful hacks to work around shortcomings in react-player + nextjs to call functions on the player
// const el = isClientSide && document.getElementById('react-player')?.firstChild
// const playerElement = el ? (el as unknown as ReactPlayerClass) : undefined

export interface OpVideoAppProps extends PlayerAppProps<PlayerApp.OpVideoApp> {}

/**
 * OpVideoApp cycles through a playlist of video URL's based on controller up/down inputs.
 * Action buttons control play/pause behaviour.
 */
export const OpVideoApp: React.FC<OpVideoAppProps> = ({ data: playlistDtos }) => {
  const playerRef = useRef<ReactPlayer | null>(null)

  // @temp @todo - temporarily use first item in the list to get the e2e/demo story working
  // @todo make design decision + handle multiple active playlists or only one for the time being
  // const playListDto = useMemo(() => playlistDtos[0], [playlistDtos])
  const videos = useMemo(
    () =>
      Array.isArray(playlistDtos[0]?.videos) && playlistDtos[0].videos.length > 0
        ? playlistDtos[0].videos.map((video) => `https://www.youtube.com/watch?v=${video.externalId}`)
        : dummyVideoGroupDtoVideos.map((video) => `https://www.youtube.com/watch?v=${video.externalId}`),
    [playlistDtos],
  )

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
  // update: or at least was when the player+joystick was a PoC prototype (issues w/ React18 + Next + react-player)
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

  // A ref callback within YouTubePlayer prevents playerRef.current from becoming null.
  // In PoC prototype his enabled far more reliable calls to playerRef.current.getCurrentTime() to save
  // the current playback time of an outgoing screen even with transitions so that it could be recalled
  //
  // This was hard-won feature for Olivia that makes a huge UX difference in real-world use so it is
  // important to fix the regression w/ current package versions and get it back.
  //
  // per above w/ latest react 18+, nextjs, and react-player there seem to be issues with progress + seek functions
  const handlePlayerRef = useCallback((node: ReactPlayer | null) => {
    if (node) {
      playerRef.current = node
    }
  }, [])

  // handle joystick actions (@todo needs refactor + accommodate exhaustive deps linter - OpVideoApp)
  useEffect(() => {
    if (joystick.button) {
      // ... not so good here
      // setIsPlayMode((currentPlayMode) => {
      //   // speak(!currentPlayMode ? 'PAUSE' : 'PLAY')
      //   return !currentPlayMode
      // })

      speak(isPlayMode ? 'PAUSE' : 'PLAY')
      setIsPlayMode(!isPlayMode)
    }

    if (joystick.up || joystick.down) {
      // PoC this worked fine but issues with latest packages
      // const currTime = playerRef.current?.getCurrentTime()

      // hack in a fix with the seek issues -- getCurrentTime() is not a function + ref inconsistency issues
      const currTime = typeof playerRef.current?.getCurrentTime === 'function' ? playerRef.current?.getCurrentTime() : 0

      if (currTime) {
        console.log('setting currtime to ', currTime)
        updateProgress(currTime)
      }
    }

    if (joystick.up) {
      speak('UP')
      setTransitionDirection('UP')
      updateScreen((screen + 1) % videos.length)
    }

    if (joystick.down) {
      speak('DOWN')
      setTransitionDirection('DOWN')
      updateScreen((screen - 1 + videos.length) % videos.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- @temp @todo refactor effect re video navigation + make robust
  }, [joystick.button, joystick.up, joystick.down, videos])

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

  // console.log(`playerRef.current is `, playerRef.current)

  return (
    <>
      {transitions((styles, screenIndex) => {
        return (
          <animated.div className="w-full h-full pointer-events-none" style={{ ...styles }}>
            {isClientSide ? (
              <ReactPlayer
                // ref={playerRef}
                ref={handlePlayerRef}
                url={videos[screenIndex]}
                playing={isPlayMode}
                width="100%"
                height="100%"
                progressInterval={1000}
                // note: ReactPlayer from `react-player/youtube` accepts the innermost object as its top-level config
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

export default OpVideoApp
