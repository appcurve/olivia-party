import React, { useRef, useEffect, useCallback } from 'react'

export type SpeakFunction = (phrase: string) => void

const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

/**
 * React context that provides a shared reference to the HTML5 text-to-speech API.
 *
 * @see useSpeech hook to use the text-to-speech function provided by this context
 */
export const SpeechContext = React.createContext<SpeakFunction | undefined>(undefined)

// return an array of available speech synthesis voices
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const vs = window.speechSynthesis.getVoices()

    // general case
    if (Array.isArray(vs) && vs.length) {
      resolve(vs)
      return
    }

    // chrome fires an event when voices ready
    window.speechSynthesis.onvoiceschanged = (event): void => {
      const vsc = (event.target as SpeechSynthesis).getVoices()
      resolve(vsc)
    }
  })
}

// choose iOS voice samantha or win10 voice zira if available, otherwise default to first en-US voice
const chooseVoice = async (): Promise<SpeechSynthesisVoice> => {
  const voices = (await getVoices()).filter((voice) => voice.lang === 'en-US')

  const samantha = voices.filter((voice) => voice.name === 'Samantha')
  const zira = voices.filter((voice) => voice.name === 'Microsoft Zira Desktop - English (United States)')

  return new Promise<SpeechSynthesisVoice>((resolve) => {
    if (samantha.length) {
      resolve(samantha[0])
    }

    if (zira.length) {
      resolve(zira[0])
    }

    resolve(voices[0])
  })
}

/**
 * React context provider that manages the text-to-speech API and provides consumers with an easy-to-use
 * `speak()` function that's compatible with most modern web browsers.
 *
 * @todo improved handling + cleanup of the chrome case for speech synthesis voices ready
 * @future additional customization options to eventually support user's choice of available voice
 */
export const SpeechContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const setVoiceRef = async (): Promise<void> => {
      if (isSpeechSupported) {
        voiceRef.current = await chooseVoice()
      }
    }

    if (isSpeechSupported) {
      setVoiceRef()
    } else {
      console.warn('text-to-speech not supported')
    }
  }, [])

  const speak = useCallback((phrase: string) => {
    if (!isSpeechSupported) {
      return
    }

    if (!voiceRef.current) {
      return
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    // create a new instance each time or else firefox won't repeat
    const utterance = new SpeechSynthesisUtterance(phrase)
    utterance.voice = voiceRef.current
    window.speechSynthesis.speak(utterance)
  }, [])

  return <SpeechContext.Provider value={speak}>{children}</SpeechContext.Provider>
}
