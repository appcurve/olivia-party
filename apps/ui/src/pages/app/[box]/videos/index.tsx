import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'

import { Spinner } from '@firx/react-feedback'
import type { ApiParentContext } from '../../../../api/types/common.types'
import type { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { useVideosQuery } from '../../../../api/hooks/videos'
import { useVideoGroupsQuery } from '../../../../api/hooks/video-groups'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../lib/router'
import { VideosManager } from '../../../../components/features/videos/VideosManager'
import { VideoGroupsManager } from '../../../../components/features/videos/VideoGroupsManager'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>['parentContext']

interface TabContentProps {
  parentContext: ParentContext
}

interface Tab {
  label: string
  paramKey: string // lowercase url friendly
  count?: number // optional count badge
  Component: React.FC<TabContentProps>
}

interface TabLayoutProps {
  tabs: Tab[]
}

const VideosTab: React.FC<TabContentProps> = () => {
  return (
    <>
      <VideosManager />
    </>
  )
}

const VideoGroupsTab: React.FC<TabContentProps> = () => {
  return (
    <>
      <VideoGroupsManager />
    </>
  )
}

/**
 * Tab layout component to add tabs to full-page/screen-scope layouts, implemented using @headlessui/react
 * `Tab` component.
 *
 * At time of writting 2022-10-01 there is an issue with headlessui `Tab.Panel` and it not being possible to
 * make the component non-focusable and not being able to use the `tabIndex` prop.
 *
 * @see {@link https://github.com/tailwindlabs/headlessui/discussions/1433#discussioncomment-3779815}
 * @see {@link https://github.com/tailwindlabs/headlessui/issues/1917}
 */
export const TabLayout: React.FC<TabLayoutProps> = ({ tabs }) => {
  const router = useRouter()
  const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(undefined)

  const boxProfileUuid = getRouterParamValue(router.query, 'box')
  const parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext'] = {
    boxProfileUuid,
  }

  const handleTabChange = (index: number): void => {
    if (tabs[index]) {
      // @see https://nextjs.org/docs/api-reference/next/router#with-url-object
      // e.g. with nextjs dynamic routes -- <Link href="/example/[...slug]" as={`/example/${post.slug}`} prefetch>
      router.push({
        pathname: router.pathname, // dynamic paths are represented in path as [varName]
        query: { box: boxProfileUuid, tab: tabs[index].paramKey }, // specify dynamic path variable value(s) as well
      })
    }
  }

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const findResult = tabs.findIndex((t) => t.paramKey === router.query['tab'])
    const tabIndex = findResult === -1 ? 0 : findResult

    if (tabIndex !== currentTabIndex) {
      setCurrentTabIndex(tabIndex)
    }
  }, [router.isReady, router.query, currentTabIndex, tabs])

  // hide tabs on first render when nextjs router + query is not yet available
  const hideTabs = currentTabIndex === undefined

  // const responsiveTabListClassName = clsx(
  //   'relative z-0 flex flex-col xs:flex-row rounded-md',
  //   'space-y-2 space-x-0 xs:space-y-0 xs:space-x-2',
  // )

  return (
    <Tab.Group selectedIndex={currentTabIndex ?? 0} onChange={handleTabChange}>
      <div className="border-b border-P-neutral-300">
        <Tab.List
          className={clsx('relative z-0 flex flex-row space-y-0 space-x-8 rounded-md', '-mb-px')}
          aria-label="Tabs for Managing Video Groups and Videos"
        >
          {tabs.map((tab) => (
            <Tab as={React.Fragment} key={tab.label}>
              {({ selected: isSelected }): JSX.Element => (
                <a
                  className={clsx(
                    'group flex py-4 px-2 border-b-2 rounded-t-sm',
                    'whitespace-nowrap cursor-pointer',
                    'transition-colors fx-focus-ring-form',
                    {
                      [clsx('font-semibold border-P-primary text-P-primary', 'hover:border-P-primary-hover')]:
                        isSelected && !hideTabs,
                      [clsx(
                        'font-medium border-transparent text-P-neutral-500',
                        'hover:text-P-neutral-600 hover:border-P-neutral-300/90',
                      )]: !(isSelected && !hideTabs),
                    },
                  )}
                >
                  {tab.label}
                  {typeof tab.count === 'number' ? (
                    <span
                      className={clsx(
                        isSelected ? 'bg-sky-100 text-P-primary' : 'bg-P-neutral-100 text-P-neutral-900',
                        'hidden ml-3 py-1 px-2.5 rounded-full text-xs font-medium md:inline-block',
                        {
                          ['group-hover:bg-P-neutral-200/70']: !isSelected,
                        },
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </a>
              )}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels as="div">
        {tabs.map((tab) => {
          return (
            <Tab.Panel
              key={tab.label}
              tabIndex={-1} // @see above comment + issue note that this is currently not supported (headless bug)
              className="py-6 focus:rounded-sm fx-focus-ring-form focus:ring-offset-8"
            >
              {!!parentContext.boxProfileUuid && <tab.Component parentContext={parentContext}></tab.Component>}
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}

export const ManageVideosIndexPage: NextPage = () => {
  const { data: videos, ...videosQuery } = useVideosQuery()
  const { data: videoGroups, ...videoGroupsQuery } = useVideoGroupsQuery()

  const isDataReady = videosQuery.isSuccess && videoGroupsQuery.isSuccess

  const tabs = React.useMemo(
    () => [
      {
        label: 'Playlists',
        paramKey: 'playlists',
        count: videoGroups?.length,
        Component: VideoGroupsTab,
      },
      {
        label: 'Videos',
        paramKey: 'videos',
        count: videos?.length,
        Component: VideosTab,
      },
    ],
    [videoGroups?.length, videos?.length],
  )

  return (
    <>
      <PageHeading showLoadingSpinner={videosQuery.isFetching || videoGroupsQuery.isFetching}>
        Manage Videos
      </PageHeading>
      <div className="mb-4 sm:mb-6">
        <p className="mb-2 sm:mb-0">Add YouTube videos and organize them into Playlists.</p>
        <p>
          Switch a Playlist to <strong>Active</strong> to load it to your Box&apos;s <strong>Video Player Mode</strong>.
        </p>
      </div>
      <div>
        {(videosQuery.isError || videoGroupsQuery.isError) && <p>Error fetching data</p>}
        {(videosQuery.isLoading || videoGroupsQuery.isLoading) && <Spinner />}
        {isDataReady && <TabLayout tabs={tabs} />}
      </div>
    </>
  )
}

export default ManageVideosIndexPage
