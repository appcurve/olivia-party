import React, { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'

import { useSpeech } from '@firx/react-player-hooks'
import { useControllerStore } from '../../stores/useControllerStore'

const phrases: Array<{
  icon: string | null // SvgIcon
  phrase: string
}> = [
  { icon: '👍', phrase: 'YES' },
  { icon: '👎', phrase: 'NO' },
  { icon: '🍕', phrase: 'Feed Me Snacks' },
  { icon: '😊', phrase: 'Yay Happy!' },
]

export const OpSpeechApp: React.FC = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  const handleNext = useCallback((): void => {
    setCurrentPhrase((currentPhrase + 1) % phrases.length)
  }, [currentPhrase])

  const handleBack = useCallback((): void => {
    setCurrentPhrase((currentPhrase - 1 + phrases.length) % phrases.length)
  }, [currentPhrase])

  const speak = useSpeech()
  const joystick = useControllerStore((state) => state.controller)

  useEffect(() => {
    if (joystick.button) {
      speak(phrases[currentPhrase].phrase)
    }

    if (joystick.up) {
      handleBack()
    }

    if (joystick.down) {
      handleNext()
    }
    // @todo refactor to make exhaustive deps happy and use speech in a react-safe way
    // (current implementation will work without issues)
  }, [joystick])

  return (
    <div className="bg-gray-50 min-h-screen min-w-full flex justify-center items-center">
      <div className="flex flex-col w-6/12 space-y-4">
        {phrases.map((phrase, index) => (
          <div
            key={phrase.phrase}
            className={clsx(
              'flex justify-center items-center border-2 border-gray-300 text-4xl p-8 rounded-md bg-gray-200 leading-none',
              {
                ['font-bold bg-yellow-50 border-gray-500 shadow-inner']: currentPhrase === index,
              },
            )}
          >
            {phrase.icon && (
              <div>{phrase.icon}</div>
              // <VectorIcon
              //   className={clsx('w-12 h-12 mr-4', {
              //     ['animate-ping']: currentPhrase === index,
              //   })}
              //   type={phrase.icon}
              // />
            )}
            <span>{phrase.phrase}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
