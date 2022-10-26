import React from 'react'
import type { NextPage } from 'next'
import clsx from 'clsx'

import { GridLayout } from '../components/layout/GridLayout'
import { FullScreenLayout } from '../components/layout/FullScreenLayout'

export const IndexPage: NextPage = (_props) => {
  return (
    <GridLayout>
      <FullScreenLayout>
        <div className="text-center">
          <h1 className="text-xl">
            Welcome to{' '}
            <span>
              Olivia<span className="italic">Party</span>
            </span>
          </h1>
          <div>Please Access via your Player URL</div>
          <div className={clsx('mt-4 mb-4 py-1.5 px-4 rounded-md bg-P-neutral-300')}>
            https://olivia.party/<span className="font-medium">PlayerCode</span>
          </div>
          {/* <div>
            <Link href="https://olivia.party">
              <a className="text-sm text-P-link-dark hover:text-P-link-dark-hover hover:underline fx-focus-highlight">
                <span className="font-medium">olivia.party</span>
              </a>
            </Link>
          </div> */}
        </div>
      </FullScreenLayout>
    </GridLayout>
  )
}

export default IndexPage
