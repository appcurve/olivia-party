import React from 'react'
import { type SpeakFunction, SpeechContext } from './SpeechContextProvider'

/**
 * React hook that provides calling functions with an easy-to-use `speak()` function that reads the given
 * string input aloud.
 *
 * The hook returns `undefined` if the speech API's voices are not available (browsers load voices asynchronously
 * and they may not be available on all browsers/systems), or in cases of error.
 *
 * To use this hook a component's must be a child of a `SpeechContextProvider`.
 *
 * @see SpeechContextProvider
 */
export const useSpeech = (): SpeakFunction => {
  const context = React.useContext(SpeechContext)

  if (!context) {
    throw new Error('useSpeech() requires context: this hook can only be used within a child of SpeechContextProvider')
  }

  return context
}
