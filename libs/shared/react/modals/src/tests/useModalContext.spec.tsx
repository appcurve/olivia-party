import * as React from 'react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithContextProvider } from './test-utils/react-test-utils'
import { ModalVariant, useModalContext } from '..'

// yarn nx test shared-react-modals --verbose --output=static --testFile=useModalContext.spec.tsx
// yarn nx test shared-react-modals --verbose --output=static --testFile=useModalContext.spec.tsx --test-name-pattern=handler

const MODAL_BODY_CONTENT = 'test modal body content' as const
const HIDE_MODAL_BUTTON_CAPTION = 'hide modal' as const
const SHOW_MODAL_BUTTON_CAPTION = 'show modal' as const

describe('useModalContext basic usage', () => {
  const App: React.FC = () => {
    const [showModal, hideModal] = useModalContext({ title: 'Modal Title', variant: ModalVariant.DEFAULT }, () => (
      <div>
        <p>{MODAL_BODY_CONTENT}</p>
        <button onClick={hideModal}>{HIDE_MODAL_BUTTON_CAPTION}</button>
      </div>
    ))

    return <button onClick={showModal}>{SHOW_MODAL_BUTTON_CAPTION}</button>
  }

  afterEach((done) => {
    act(() => {
      done()
    })
  })

  it('does not render modal content if showModal is not called', () => {
    const { queryByText } = renderWithContextProvider(<App />)

    expect(queryByText(MODAL_BODY_CONTENT)).not.toBeTruthy()
    expect(queryByText(HIDE_MODAL_BUTTON_CAPTION)).not.toBeTruthy()
    expect(queryByText(SHOW_MODAL_BUTTON_CAPTION)).toBeTruthy()
  })

  it('renders the modal with content when showModal is called in event handler', async () => {
    const { getByText, queryByText } = renderWithContextProvider(<App />)

    fireEvent.click(getByText(SHOW_MODAL_BUTTON_CAPTION))

    await screen.findByText(MODAL_BODY_CONTENT)
    expect(queryByText(MODAL_BODY_CONTENT)).toBeTruthy()
  })

  it('hides the modal when hideModal function is called', async () => {
    const { getByText, queryByText } = renderWithContextProvider(<App />)

    fireEvent.click(getByText(SHOW_MODAL_BUTTON_CAPTION))
    await screen.findByText(MODAL_BODY_CONTENT)

    fireEvent.click(getByText(HIDE_MODAL_BUTTON_CAPTION))

    await waitFor(() => {
      // use queryBy vs. getBy to avoid throwing in the query itself
      expect(queryByText(MODAL_BODY_CONTENT)).not.toBeInTheDocument()
    })

    expect(queryByText(MODAL_BODY_CONTENT)).not.toBeTruthy()
    expect(queryByText(HIDE_MODAL_BUTTON_CAPTION)).not.toBeTruthy()
  })

  it('hides modal when parent modal context component unmounts', async () => {
    const { getByText, queryByText, rerender } = renderWithContextProvider(
      <div>
        <App />
      </div>,
    )

    fireEvent.click(getByText(SHOW_MODAL_BUTTON_CAPTION))
    await screen.findByText(MODAL_BODY_CONTENT)

    rerender(<div />)

    await waitFor(() => {
      // use queryBy vs. getBy to avoid throwing in the query itself
      expect(queryByText(MODAL_BODY_CONTENT)).not.toBeInTheDocument()
    })

    expect(queryByText(MODAL_BODY_CONTENT)).not.toBeTruthy()
    expect(queryByText(HIDE_MODAL_BUTTON_CAPTION)).not.toBeTruthy()
  })
})
