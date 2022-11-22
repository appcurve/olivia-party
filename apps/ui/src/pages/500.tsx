import type { NextPage } from 'next'
import { PageHeading } from '../components/elements/headings/PageHeading'

const CustomError500Page: NextPage = (_props) => {
  return (
    <div className="p-8 rounded-md bg-P-error-300">
      <PageHeading>Error 500</PageHeading>
    </div>
  )
}

export default CustomError500Page
