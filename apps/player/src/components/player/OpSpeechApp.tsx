import React, { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'

import { useSpeech } from '@firx/react-player-hooks'
import { useControllerStore } from '../../stores/useControllerStore'
import { usePlayerContext } from '../../context/PlayerContextProvider'

const phrases: Array<{
  icon: string | null
  phrase: string
}> = [
  { icon: '👍', phrase: 'YES' },
  { icon: '👎', phrase: 'NO' },
  { icon: '🍕', phrase: 'Feed Me Snacks' },
  { icon: '😊', phrase: 'Yay Happy!' },
]

/**
 * OliviaParty App - Speech Mode
 *
 * User can move the joystick up/down to select a phrase and then read it aloud with the main action button.
 */
export const OpSpeechApp: React.FC = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  const playerUid = usePlayerContext()
  console.log('player, ', playerUid)

  const handleNext = useCallback((): void => {
    setCurrentPhrase((curr) => (curr + 1) % phrases.length)
  }, [])

  const handleBack = useCallback((): void => {
    setCurrentPhrase((curr) => (curr - 1 + phrases.length) % phrases.length)
  }, [])

  const speak = useSpeech()
  const joystick = useControllerStore((state) => state.controller)

  useEffect(() => {
    if (joystick.button) {
      speak(phrases[currentPhrase].phrase)
    }
  }, [joystick.button, currentPhrase, speak])

  useEffect(() => {
    if (joystick.up) {
      handleBack()
    }

    if (joystick.down) {
      handleNext()
    }
  }, [joystick.up, joystick.down, handleNext, handleBack])

  return (
    <div className="bg-P-neutral-50 min-h-screen min-w-full flex justify-center items-center">
      <div className="flex flex-col w-6/12 space-y-4">
        {phrases.map((phrase, index) => (
          <div
            key={phrase.phrase}
            className={clsx(
              'flex justify-center items-center border-2 p-8 rounded-md',
              'text-4xl leading-none border-P-neutral-300 bg-P-neutral-200 ',
              {
                ['font-bold bg-yellow-50 border-P-neutral-500 shadow-inner']: currentPhrase === index,
              },
            )}
          >
            {phrase.icon && (
              <div
                className={clsx('mr-2', {
                  ['animate-bounce']: currentPhrase === index,
                })}
              >
                {phrase.icon}
              </div>
            )}
            <span>{phrase.phrase}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
