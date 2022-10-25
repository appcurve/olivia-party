import { useRef, useCallback, useEffect } from 'react'
import { useInterval } from '../use-interval/useInterval'

const haveEvents = typeof window !== 'undefined' && 'ongamepadconnected' in window

export interface Joystick {
  button: boolean
  altButton: boolean
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export const initialJoystickState: Joystick = {
  button: false,
  altButton: false,
  up: false,
  down: false,
  left: false,
  right: false,
}

/**
 * React hook for a component to receive input from a generic USB joystick/gamepad via the Gamepad API.
 *
 * The hook will call the given callback with an updated `Joystick` object when the input state
 * of the first connected + recognized gamepad (joystick) changes.
 *
 * The implementation tracks device inputs `btn0`, `btn1`, `axis0` (x-axis), and `axis1` (y-axis).
 * These map to data provided by popular generic USB controllers arcade joysticks.
 *
 * Note you may need to extend or fork this hook to support multiple gamepads, a different set of input mappings,
 * greater numbers of buttons, etc.
 *
 * @param onJoystickChange stable reference to a callback that this hook will fire gamepad/joystick changes to
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API}
 */
export const useJoystick = (onJoystickChange: (status: Joystick) => void): void => {
  const joystickRef = useRef<Joystick>(initialJoystickState)

  const requestRef = useRef<number | null>(null)

  const addGamepad = useCallback(
    (gamepad: Gamepad) => {
      // @future -- concept to support multiple controllers --
      // gamepadRef.current = {
      //  ...gamepadRef.current,
      //  [gamepad.index]: gamepad,
      // }

      const {
        index: _index,
        id: _id,
        buttons: [btn0, btn1],
        axes: [axis0, axis1],
      } = gamepad

      const latest: Joystick = {
        button: btn0?.pressed,
        altButton: btn1?.pressed,
        up: axis1 < -0.5,
        down: axis1 > 0.5,
        left: axis0 < -0.5,
        right: axis0 > 0.5,
      }

      const { button, altButton, up, down, left, right } = joystickRef.current

      if (
        latest.button !== button ||
        latest.altButton !== altButton ||
        latest.up !== up ||
        latest.down !== down ||
        latest.left !== left ||
        latest.right !== right
      ) {
        joystickRef.current = {
          button: latest.button,
          altButton: latest.altButton,
          up: latest.up,
          down: latest.down,
          left: latest.left,
          right: latest.right,
        }

        onJoystickChange(joystickRef.current)
      }
    },
    [onJoystickChange],
  )

  const scanGamepads = useCallback(() => {
    const joystick = navigator.getGamepads()

    // assume single controller for current purposes
    if (joystick.length && joystick[0]) {
      addGamepad(joystick[0])
    }
  }, [addGamepad])

  // update each gamepad's status on each 'tick'
  const animate = useCallback(
    (_time: DOMHighResTimeStamp) => {
      if (!haveEvents) {
        scanGamepads()
      }

      requestRef.current = requestAnimationFrame(animate)
    },
    [scanGamepads],
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)

    return (): void => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])

  // check for new gamepads at a regular interval
  useInterval(() => {
    if (!haveEvents) {
      scanGamepads()
    }
  }, 1000)

  const handleConnected = useCallback(
    (event: GamepadEvent) => {
      console.log('A gamepad/joystick connected:', event)
      addGamepad(event.gamepad)
    },
    [addGamepad],
  )

  const handleDisconnected = useCallback((event: GamepadEvent) => {
    console.log('A gamepad/joystick disconnected:', event)
  }, [])

  useEffect(() => {
    window.addEventListener('gamepadconnected', handleConnected)
    window.addEventListener('gamepaddisconnected', handleDisconnected)

    return (): void => {
      window.removeEventListener('gamepadconnected', handleConnected)
      window.removeEventListener('gamepadconnected', handleDisconnected)
    }
  }, [handleConnected, handleDisconnected])
}
