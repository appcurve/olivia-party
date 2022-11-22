import type { NextPage } from 'next'

const CustomError404Page: NextPage = (_props) => {
  return (
    <div className="p-8 rounded-md bg-P-error-300">
      <h1 className="text-2xl">Error 404</h1>
    </div>
  )
}

export default CustomError404Page
