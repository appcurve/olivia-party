import React, { useState, useEffect, useCallback, useMemo } from 'react'
import clsx from 'clsx'

import { useSpeech } from '@firx/react-player-hooks'
import { PlayerApp, type PlayerAppProps, type PhraseListDto } from '@firx/op-data-api'
import { useControllerStore } from '../../stores/useControllerStore'

export interface OpSpeechAppProps extends PlayerAppProps<PlayerApp.OpSpeechApp> {}

// @temp for dev/demo purposes fallback to a dummy phrase list
// @future REMOVE and have elegant handling of no-content case and have a separate demo deploy
const dummyPhraseListDto: PhraseListDto = {
  uuid: 'abcd-1234',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'Demo Phrase List',
  phrases: [
    {
      phrase: 'Yes',
      emoji: '👍',
      label: 'Yes',
    },
    {
      phrase: 'No',
      emoji: '👎',
      label: 'No',
    },
    {
      phrase: 'Hello',
      emoji: '👋',
      label: 'Hello',
    },
  ],
  schemaVersion: 'v1',
  enabled: true,
}

/**
 * OliviaParty App - Speech Mode
 *
 * User can move the joystick up/down to select a phrase and then read it aloud with the main action button.
 */
export const OpSpeechApp: React.FC<OpSpeechAppProps> = ({ data: phraseListDtos }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  // const playerContext = usePlayerContext()
  // console.log('SPEECH APP CALLED WITH PROPS', props)
  // temporarily lets use first item in the list
  const phraseListDto = useMemo(
    () => (Array.isArray(phraseListDtos) && phraseListDtos.length > 0 ? phraseListDtos[0] : dummyPhraseListDto),
    [phraseListDtos],
  )

  const handleNext = useCallback((): void => {
    setCurrentPhrase((curr) => (curr + 1) % phraseListDto.phrases.length)
  }, [phraseListDto.phrases.length])

  const handleBack = useCallback((): void => {
    setCurrentPhrase((curr) => (curr - 1 + phraseListDto.phrases.length) % phraseListDto.phrases.length)
  }, [phraseListDto.phrases.length])

  const speak = useSpeech()
  const joystick = useControllerStore((state) => state.controller)

  useEffect(() => {
    if (joystick.button) {
      speak(phraseListDto.phrases[currentPhrase].phrase)
    }
  }, [joystick.button, currentPhrase, speak, phraseListDto.phrases])

  useEffect(() => {
    if (joystick.up) {
      handleBack()
    }

    if (joystick.down) {
      handleNext()
    }
  }, [joystick.up, joystick.down, handleNext, handleBack])

  return (
    <div className="bg-P-neutral-50 min-h-screen min-w-full flex flex-col justify-center items-center">
      <div className="text-3xl mb-4 capitalize">{phraseListDto.name}</div>
      <div className="flex flex-col w-6/12 space-y-4">
        {phraseListDto.phrases.map((phrase, index) => (
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
            {phrase.emoji && (
              <div
                className={clsx('mr-2', {
                  ['animate-bounce']: currentPhrase === index,
                })}
              >
                {phrase.emoji}
              </div>
            )}
            <span>{phrase.phrase}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
