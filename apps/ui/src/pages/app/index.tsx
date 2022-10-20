import type { NextPage } from 'next'
import clsx from 'clsx'

import { BsJoystick } from 'react-icons/bs'

import { Spinner } from '@firx/react-feedback'
import { PageHeading } from '../../components/elements/headings/PageHeading'
import { useBoxProfilesQuery } from '../../api/hooks/box-profiles'
import { Heading } from '../../components/elements/headings/Heading'
import { NavLink } from '../../components/elements/inputs/NavLink'
import { useAuthSession } from '../../context/SessionContextProvider'

const OLIVIA_PARTY_BOX_URL = 'https://play.olivia.party'

// export interface Announcement {
//   title: string
//   preview: string
//   url: string
// }

// export interface AnnouncementsProps {
//   items: Announcement[]
// }

// const announcements: Announcement[] = [
//   { title: 'hello world', preview: 'lorem ipsum dolor sit amet', url: 'https://google.com/1' },
//   { title: 'world hi', preview: 'lorem ipsum dolor sit amet', url: 'https://google.com/2' },
//   { title: 'hey yo', preview: 'lorem ipsum dolor sit amet', url: 'https://google.com/3' },
//   { title: 'dolor sit amet', preview: 'lorem ipsum dolor sit amet', url: 'https://google.com/4' },
// ]

// const Announcements: React.FC<AnnouncementsProps> = ({ items }) => {
//   return (
//     <div className="flow-root">
//       <ul className="-my-4 divide-y divide-P-neutral-200">
//         {items.map((item) => (
//           <li key={item.url} className="py-4">
//             <h4 className="font-medium text-P-neutral-700 mb-1">{item.title}</h4>
//             <p className="text-P-neutral-600">{item.preview}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

export const AppIndexPage: NextPage = (_props) => {
  const { profile } = useAuthSession()
  const { data, isSuccess, isLoading, isError } = useBoxProfilesQuery()

  return (
    <div>
      <PageHeading bottomMargin="small">
        Olivia<span className="italic">Party</span>
      </PageHeading>
      <div className="mb-4">
        <p>Nice to see you, {profile.name}</p>
      </div>
      <Heading type="h3">Player Profiles</Heading>
      <div>
        {isError && <p>error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
          <>
            <div className="">
              <div className="grid grid-cols-1 gap-2">
                {data?.map((box) => (
                  <div
                    key={box.uuid}
                    className={clsx(
                      'block md:flex md:flex-wrap md:items-center p-4 overflow-hidden',
                      'border border-P-neutral-200 rounded-md overflow-hidden',
                      'text-P-primary',
                    )}
                  >
                    <div className="block sm:flex flex-1">
                      <BsJoystick
                        className="hidden sm:block h-12 w-12 pr-4 sm:pr-6 text-P-primary"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col min-w-[20rem]">
                        <div className="font-medium">{box.name}</div>
                        <div className="block sm:flex p-2 mt-1 sm:items-center rounded-md bg-P-neutral-100">
                          <div className="text-xs uppercase mr-2 whitespace-nowrap">Web Player</div>
                          <div className="leading-none">
                            {OLIVIA_PARTY_BOX_URL}/{box.urlCode}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex mt-4 md:mt-0 justify-center md:justify-end space-x-4 px-2 flex-1 font-medium leading-tight">
                      <NavLink href={`/app/${box.uuid}/videos`}>Video Playlists</NavLink>
                      <button className="text-left" onClick={(): void => alert('not implemented yet!')}>
                        Spoken Phrases
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No Box Profiles found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppIndexPage
