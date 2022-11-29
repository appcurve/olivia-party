import type { NextPage } from 'next'
import Link from 'next/link'
import clsx from 'clsx'

import { BsJoystick } from 'react-icons/bs'

import { Spinner } from '@firx/react-feedback'
import { useAuthSession } from '../../context/SessionContextProvider'
import { useBoxProfilesQuery } from '../../api/hooks/players'
import { PageHeading } from '../../components/elements/headings/PageHeading'
import { Heading } from '../../components/elements/headings/Heading'
import { NavLink } from '../../components/elements/inputs/NavLink'
import { PLAYER_URL } from '../../api/constants/urls'

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

export interface PlayerLinkProps {
  code: string
  appendClassName?: string
}

const PlayerLink: React.FC<PlayerLinkProps> = ({ code }) => {
  return (
    <Link href={`${PLAYER_URL}/${code}`} target="_blank" rel="noopener noreferrer">
      <a
        className={clsx(
          'block sm:flex px-2 sm:px-4 py-2 sm:items-center rounded-md bg-P-neutral-100 hover:bg-P-neutral-200',
          'fx-focus-ring fx-focus-darker',
        )}
      >
        <div className="text-xs uppercase mr-2 whitespace-nowrap sm:leading-6">Web Player</div>
        <div className="leading-none text-xs xs:text-base pt-1 sm:pt-0 sm:pb-0.5">
          {PLAYER_URL}/{code}
        </div>
      </a>
    </Link>
  )
}

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
      <Heading type="h3" appendClassName="mb-2">
        Player Profiles
      </Heading>
      <div>
        {isError && <p>error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
          <>
            <div className="">
              <div className="grid grid-cols-1 gap-2">
                {data?.map((player) => (
                  <div
                    key={player.uuid}
                    className={clsx(
                      'block md:flex md:flex-wrap md:items-center p-4 overflow-hidden',
                      'border border-P-neutral-200 rounded-md overflow-hidden',
                      'text-P-primary',
                    )}
                  >
                    <div className="block sm:flex items-center flex-1">
                      <BsJoystick
                        className="hidden md:block h-12 w-12 pr-4 sm:pr-6 text-P-primary"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <div className="font-medium text-base mb-1">{player.name}</div>
                        <PlayerLink code={player.urlCode} />
                      </div>
                      <div
                        className={clsx(
                          'flex mt-4 md:mt-0 justify-center md:justify-end items-center',
                          'space-x-4 px-2 sm:px-4 flex-1 font-medium leading-tight',
                          'text-center text-sm xs:text-base',
                        )}
                      >
                        <NavLink href={`/app/${player.uuid}/videos`} focusStyle="default-darker">
                          Video Playlists
                        </NavLink>
                        <NavLink href={`/app/${player.uuid}/phrases`} focusStyle="default-darker">
                          Spoken Phrases
                        </NavLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-P-neutral-600">No active players found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppIndexPage
