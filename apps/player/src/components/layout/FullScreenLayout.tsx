import React from 'react'

export const FullScreenLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="w-full-h-full flex justify-center items-center">{children}</div>
}

// export const PlayerAppLayout
