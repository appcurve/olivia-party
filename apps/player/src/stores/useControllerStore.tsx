import create from 'zustand'
import { initialJoystickState, Joystick } from '@firx/react-player-hooks'

interface ControllerStoreState {
  controller: Joystick
  updateControllerState: (update: Joystick) => void
}

export const useControllerStore = create<ControllerStoreState>((set) => ({
  controller: initialJoystickState,
  updateControllerState: (update: Joystick): void => {
    set({ controller: update })
  },
}))
