import React from 'react'
import { render } from '@testing-library/react'

import IndexPage from '../src/pages'

// @todo some basic tests for the player

// import DynamicIndexPage from '../src/pages/[player]'
// import { SpeechContextProvider } from '@firx/react-player-hooks'
// import { PlayerContextProvider } from '../src/context/PlayerContextProvider'

// // returns children even in case of !isPlayerReady
// const TestContextParent: React.FC<React.PropsWithChildren> = ({ children }) => {
//   return (
//     <SpeechContextProvider>
//       <PlayerContextProvider>
//         {(isPlayerReady): JSX.Element => (isPlayerReady ? <>{children}</> : <>{children}</>)}
//       </PlayerContextProvider>
//     </SpeechContextProvider>
//   )
// }

describe('IndexPage (Default)', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IndexPage />)
    expect(baseElement).toBeTruthy()
  })
})

// describe('DynamicIndexPage (Player)', () => {
//   it('should render successfully', () => {
//     const { baseElement } = render(
//       <TestContextParent>
//         <DynamicIndexPage />
//       </TestContextParent>,
//     )
//     expect(baseElement).toBeTruthy()
//   })
// })
