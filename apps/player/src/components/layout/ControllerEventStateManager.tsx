import React, { useState, useCallback, useEffect } from 'react'

import { useJoystick, Joystick, initialJoystickState } from '@firx/react-player-hooks'
import { useKeyboard, KeyboardNavigation, initialKeyboardNavigationState } from '@firx/react-player-hooks'

import { useControllerStore } from '../../stores/useControllerStore'

/**
 * Input event to state manager component that maps updates from "controller" hardware: physical devices
 * such as the joystick/gamepad and keyboard; to a globally-accessible state.
 *
 * The OliviaParty player leverages the lightweight `zustand` state management package.
 *
 * When added as a high-level component in the React tree (such as in `_app.tsx`) the `ControllerEventStateManager`
 * ensures that other player components can easily "tap in" to the controller state and react to changes in the
 * declarative and idiomatic "React Way".
 */
export const ControllerEventStateManager: React.FC = () => {
  const [joystick, setJoystick] = useState<Joystick>(initialJoystickState)
  const [keyboard, setKeyboard] = useState<KeyboardNavigation>(initialKeyboardNavigationState)

  const handleJoystickChange = useCallback((joystickState: Joystick) => {
    setJoystick({ ...joystickState })
  }, [])

  const handleKeyboardChange = useCallback((keyboardState: KeyboardNavigation) => {
    setKeyboard({ ...keyboardState })
  }, [])

  useJoystick(handleJoystickChange)
  useKeyboard(handleKeyboardChange)

  const updateControllerState = useControllerStore((state) => state.updateControllerState)

  useEffect(() => {
    updateControllerState({
      up: joystick.up || keyboard.up,
      down: joystick.down || keyboard.down,
      left: joystick.left || keyboard.left,
      right: joystick.right || keyboard.right,
      button: joystick.button || keyboard.space,
      altButton: joystick.altButton || keyboard.shift,
    })
  }, [
    updateControllerState,
    joystick.up,
    joystick.down,
    joystick.left,
    joystick.right,
    joystick.button,
    joystick.altButton,
    keyboard.up,
    keyboard.down,
    keyboard.left,
    keyboard.right,
    keyboard.shift,
    keyboard.space,
  ])

  return null
}
