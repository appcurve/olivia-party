import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { getApiEvents, EVENT_AUTH_ERROR } from '@firx/react-fetch'
import { useModalContext } from '@firx/react-modals'

import { useAuthSignOut } from '../../../api/hooks/auth'
import { ActionButton } from '../../elements/inputs/ActionButton'

export const AuthErrorListener: React.FC = () => {
  const router = useRouter()
  const { endSession } = useAuthSignOut()

  const [showExpiredModal] = useModalContext(
    {
      title: 'Session Expired',
    },
    <div>
      <div className="mb-4">Your session has expired. Please sign-in again.</div>
      <div className="flex justify-end">
        <div className="ml-auto">
          <ActionButton scheme="dark" onClick={(): Promise<boolean> => router.push('/sign-in')}>
            Sign In
          </ActionButton>
        </div>
      </div>
    </div>,
  )

  useEffect(() => {
    const handler = (): void => {
      endSession()
      showExpiredModal()
    }

    getApiEvents().on(EVENT_AUTH_ERROR, handler)

    return function cleanup() {
      getApiEvents().off(EVENT_AUTH_ERROR, handler)
    }
  }, [endSession, showExpiredModal])

  return null
}
