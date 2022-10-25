import React from 'react'
import clsx from 'clsx'

/**
 * Full-screen grid layout for the OliviaParty player.
 *
 * @future consider a permanent header + footer, e.g. grid-cols-3 + grid-rows-3
 */
export const GridLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main
      className={clsx(
        'grid grid-cols-1 grid-rows-1 min-h-screen min-w-max',
        'bg-P-neutral-500 justify-center items-center overflow-hidden',
      )}
    >
      {children}
    </main>
  )
}
