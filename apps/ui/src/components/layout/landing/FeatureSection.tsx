import React from 'react'
import clsx from 'clsx'

import { AdjustmentsVerticalIcon, BoltIcon } from '@heroicons/react/24/outline'
import { GiTechnoHeart as GiTechnoHeartIcon } from 'react-icons/gi'
import { FaCoins as FaCoinsIcon } from 'react-icons/fa'

const FeatureList: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ul className="pb-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">{children}</ul>
}

const FeatureListItem: React.FC<{
  heading: string
  caption: string | React.ReactNode
  SvgIcon: React.FC<React.ComponentProps<'svg'>>
  iconOverrideClassName?: string
}> = ({ heading, caption, iconOverrideClassName, SvgIcon }) => {
  return (
    <li className="mt-10 md:mt-0">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-md bg-P-background-contrast-bright">
            <SvgIcon className={clsx(iconOverrideClassName || 'w-6 h-6')} />
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-medium leading-6 text-P-subheading">{heading}</h4>
          <p className="mt-2 text-base leading-6 text-P-neutral-500">{caption}</p>
        </div>
      </div>
    </li>
  )
}

export const FeatureSection: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h3
            className={clsx(
              'mt-2 text-P-heading',
              'text-3xl font-extrabold leading-8 tracking-tight text-heading sm:text-4xl sm:leading-10',
            )}
          >
            Accessibility for everyone
          </h3>
          <p className="max-w-2xl mt-4 text-xl leading-7 text-P-neutral-600 lg:mx-auto">
            Affordable hardware and software solutions designed for customization&nbsp;and&nbsp;hackability.{' '}
            <br className="block xs:hidden" />
            <span className="inline-block xs:inline mt-2 xs:mt-0">
              <span className="underline decoration-P-neutral-500 whitespace-nowrap">Build your own</span> or{' '}
              <span className="underline decoration-P-neutral-500 whitespace-nowrap">order from us</span>.
            </span>
          </p>
        </div>

        <div className="mt-10">
          <FeatureList>
            <FeatureListItem
              heading="Affordable devices"
              caption={`Our open hardware designs can be easily assembled from affordable and widely available off-the-shelf components.`}
              SvgIcon={FaCoinsIcon} // alternate: BankNotesIcon
              iconOverrideClassName="h-[1.2rem] w-[1.2rem]"
            />
            <FeatureListItem
              heading="Built using web technology"
              caption={
                <>
                  Modern browsers are the ideal foundation for creating apps for accessible devices. Streaming, speech,
                  3D, gyro, USB&hellip; and more&hellip; <span className="italic font-medium">for free!</span>
                </>
              }
              SvgIcon={BoltIcon}
            />
            <FeatureListItem
              heading="Free app control panel &amp; player"
              caption={
                <>
                  We host a free service for users and caregivers to manage the{' '}
                  <span className="whitespace-nowrap">OP&ndash;Apps</span> that run on our devices and to provide a
                  personal web-based player.
                </>
              }
              SvgIcon={AdjustmentsVerticalIcon}
            />

            <FeatureListItem
              heading="Developers welcome"
              caption="Our mix of open source, web technology, and everyday parts means that it's easy for you to hack, contribute, and build your own apps."
              SvgIcon={GiTechnoHeartIcon} // alternate: CodeBracketIcon
            />
          </FeatureList>
        </div>
      </div>
    </div>
  )
}