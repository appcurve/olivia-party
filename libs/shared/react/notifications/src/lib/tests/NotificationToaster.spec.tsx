import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'

import { NotificationToaster } from '../components/toasts/NotificationToaster'
import { toastNotification } from '../components/toasts/toast-notification'

describe('NotificationToaster', () => {
  beforeEach(() => {
    toastNotification.remove()
    jest.useFakeTimers()
  })

  afterEach((done) => {
    act(() => {
      jest.runAllTimers()
      jest.useRealTimers()
      done()
    })
  })

  it('should render NotificationToaster successfully', () => {
    const { baseElement } = render(<NotificationToaster />)
    expect(baseElement).toBeTruthy()
  })

  it('renders various toast notifications supported by underlying react-hot-toast library', async () => {
    render(<NotificationToaster />)

    act(() => {
      toastNotification('basic toast')
    })

    act(() => {
      toastNotification.success('success toast')
    })

    act(() => {
      toastNotification.error('error toast')
    })

    act(() => {
      // intentionally omit the word 'loading' in the toast message (Spinner has 'Loading…' in aria-label)
      toastNotification.loading('spinner toast')
    })

    act(() => {
      toastNotification('emoji icon toast', {
        icon: '🍻',
      })
    })

    expect(screen.queryByText(/basic toast/i)).toBeInTheDocument()
    expect(screen.queryByText(/success toast/i)).toBeInTheDocument()
    expect(screen.queryByText(/error toast/i)).toBeInTheDocument()
    expect(screen.queryByText(/emoji icon toast/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Loading/i)).toBeInTheDocument()
    expect(screen.queryByText('🍻')).toBeInTheDocument()
  })

  it('supports toast notifications triggered from within an event handler', async () => {
    render(
      <div>
        <button
          type="button"
          onClick={(): void => {
            toastNotification('hello world')
          }}
        >
          Click Me
        </button>
        <NotificationToaster />
      </div>,
    )

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    })

    await screen.findByText(/hello world/i)
    expect(screen.queryByText(/hello world/i)).toBeInTheDocument()
  })

  it('does not break promise toasts of the underlying react-hot-toast library', async () => {
    const WAIT_DELAY = 500

    const waitTime = (time: number): void => {
      act(() => {
        jest.advanceTimersByTime(time)
      })
    }

    render(
      <div>
        <button
          type="button"
          onClick={(): void => {
            const sleep = new Promise((resolve) => {
              setTimeout(resolve, WAIT_DELAY)
            })

            toastNotification.promise(sleep, {
              loading: 'Loading',
              success: 'Success',
              error: 'Error',
            })
          }}
        >
          Click Me
        </button>
        <NotificationToaster />
      </div>,
    )

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    })

    await screen.findByText(/loading/i)
    expect(screen.queryByText(/loading/i)).toBeInTheDocument()

    waitTime(WAIT_DELAY)
    await waitFor(() => {
      expect(screen.queryByText(/success/i)).toBeInTheDocument()
    })
  })
})
