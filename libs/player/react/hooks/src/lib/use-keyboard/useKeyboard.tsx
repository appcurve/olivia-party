import { useCallback, useEffect, useRef } from 'react'

// reference for keyboard key values:
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

export interface KeyboardNavigation {
  space: boolean
  shift: boolean
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export const initialKeyboardNavigationState: KeyboardNavigation = {
  space: false,
  shift: false,
  up: false,
  down: false,
  left: false,
  right: false,
}

const keyNameDict = {
  ' ': 'space',
  Spacebar: 'space',
  Shift: 'shift',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

const haveWindow = typeof window === 'object'

/**
 * React hook for a component to receive updates to the standard gaming inputs of a standard keyboard.
 *
 * The implementation follows the arrow keys + W/S/A/D + space + shift via keydown + keyup events.
 *
 * The hook will call the provided function with a `KeyboardNavigation` object when the supported keys
 * change. The callback function must be a stable reference (e.g. memoized with useCallback()).
 *
 * Although the OliviaParty player was designed for use with physical input devices (e.g. joysticks)
 * and/or touch interfaces, complementary keyboard support is ideal for a variety following use-cases:
 *
 * - custom assistive device input hardware that interfaces as a keyboard (various microcontrollers such
 *   as the Arduino Pro Micro can emulate USB devices including keyboards and mice)
 * - enabling options for caregivers to provide assistance to users with a wired or wireless keyboard
 * - developer workflow, QA, training, demonstrations where hardware may not be handy or convenient
 *
 * @param onKeyboardChange stable callback that the hook will send keyboard updates to
 */
export const useKeyboard = (onKeyboardChange: (status: KeyboardNavigation) => void): void => {
  const keyboardRef = useRef<KeyboardNavigation>(initialKeyboardNavigationState)

  const keyupHandler = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event

      // debug
      // console.log(key)

      if (
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'W' ||
        key === 'S' ||
        key === 'A' ||
        key === 'D' ||
        key === ' ' ||
        key === 'Spacebar' ||
        key === 'Shift'
      ) {
        event.stopPropagation()

        keyboardRef.current = {
          ...keyboardRef.current,
          [keyNameDict[key]]: false,
        }

        onKeyboardChange(keyboardRef.current)
      }
    },
    [onKeyboardChange],
  )

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event

      // debug
      // console.log(key)

      if (
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'W' ||
        key === 'S' ||
        key === 'A' ||
        key === 'D' ||
        key === ' ' ||
        key === 'Spacebar' ||
        key === 'Shift'
      ) {
        event.stopPropagation()

        if (event.repeat) {
          return
        }

        keyboardRef.current = {
          ...keyboardRef.current,
          [keyNameDict[key]]: true,
        }

        onKeyboardChange(keyboardRef.current)
      }
    },
    [onKeyboardChange],
  )

  /*
  const keypressHandler = (event: KeyboardEvent) => {
    event.stopPropagation()
  }
  */

  useEffect(() => {
    if (!haveWindow) {
      return
    }

    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)
    // window.addEventListener('keypress', keypressHandler)

    return (): void => {
      window.removeEventListener('keydown', keydownHandler)
      window.removeEventListener('keyup', keyupHandler)
      // window.removeEventListener('keypress', keypressHandler)
    }
  }, [keydownHandler, keyupHandler])
}
