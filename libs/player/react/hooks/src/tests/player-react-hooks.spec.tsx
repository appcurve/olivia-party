import React from 'react'
import { render } from '@testing-library/react'

import { useInterval, useJoystick, useKeyboard, useSpeech, SpeechContextProvider } from '..'

const TestComponent: React.FC = () => {
  const _ui = useInterval(() => undefined, 1000)
  const _uj = useJoystick((_status) => undefined)
  const _uk = useKeyboard((_status) => undefined)
  const _us = useSpeech()

  return <div>Hello World</div>
}

const TestContextParent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <SpeechContextProvider>{children}</SpeechContextProvider>
}

describe('PlayerReactHooks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestContextParent>
        <TestComponent />
      </TestContextParent>,
    )
    expect(baseElement).toBeTruthy()
  })
})
