import { Spinner } from '@firx/react-feedback'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export interface LandingFallbackProps {
  showSpinner: boolean
}

export const LandingFallback: React.FC<LandingFallbackProps> = ({ showSpinner }) => {
  const router = useRouter()
  const [paramsJson, setParamsJson] = useState<string>()

  useEffect(() => {
    if (router.isReady) {
      setParamsJson(JSON.stringify(router.query))
    }
  }, [router.isReady, router.query])

  return (
    <div className="text-center">
      {showSpinner && (
        <div className="my-2 flex justify-center">
          <Spinner />
        </div>
      )}
      <h1 className="text-xl">
        Welcome to{' '}
        <span>
          Olivia<span className="italic">Party</span>
        </span>
      </h1>
      <div>Please Access via your Player URL</div>
      <div className={clsx('mt-4 mb-4 py-1.5 px-4 rounded-md leading-none bg-P-neutral-300')}>
        https://olivia.party/<span className="font-medium">PlayerCode</span>
      </div>

      <div className="text-P-neutral-200 text-xs">{paramsJson}</div>
    </div>
  )
}
