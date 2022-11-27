import React from 'react'
import { ComputerDesktopIcon, DeviceTabletIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ProjectNameInline } from '../../brand/ProjectNameInline'
import { AiOutlineUsb as AiOutlineUsbIcon } from 'react-icons/ai'
import { BsController as BsControllerIcon } from 'react-icons/bs'

import { SlideInAnimation } from '@firx/react-animated'
import { AnimateOnIntersect } from '@firx/react-animated'

const controllerFeatures = [
  {
    id: 1,
    name: 'Our guides make it easy',
    description:
      'Our tutorials show you what to get and how to connect everything so it works as an OliviaParty controller.',
    icon: SparklesIcon,
  },
  {
    id: 2,
    name: 'Tons of plug-and-play options',
    description:
      'Many options from touchscreens to joysticks to foot switches exist that support USB and work right out-of-the box.',
    icon: AiOutlineUsbIcon,
  },
  {
    id: 3,
    name: 'Ultimate customizability',
    description:
      'OliviaParty controllers can evolve and grow with their users and their needs as they change over time.',
    icon: BsControllerIcon,
  },
]

// Most modern-ish computing devices, tablets, and smartphones that support USB and can run a current browser are ready for OliviaParty

const communicationFeatures = [
  {
    id: 1,
    name: 'Go big and bright',
    description:
      'Connect your device to a monitor, touchscreen, TV, or even projector to provide your user with a large-format player experience.',
    icon: ComputerDesktopIcon,
  },
  {
    id: 2,
    name: 'Go small and mobile',
    description:
      "Laptops, tablets, and Single-Board-Computers (SBC's) like Raspberry Pi serve as great mobile-ready platforms for OliviaParty.",
    icon: DeviceTabletIcon,
  },
]

// reminder: the tailwindui original that this was based on had the background dots to give some spacing feel

export interface ImagePlaceholderProps {
  pbPercent?: number
}

const ImagePlaceholder = React.forwardRef<HTMLDivElement, ImagePlaceholderProps>(function ImagePlaceholder(
  { pbPercent = 50 }, // pb-[50%]
  forwardedRef,
) {
  return (
    <div ref={forwardedRef} className="relative h-0 overflow-hidden" style={{ paddingBottom: `${pbPercent}%` }}>
      <div className="absolute t-0 l-0 w-full h-full p-4">
        <div className="flex justify-center items-center bg-P-neutral-200 rounded-md h-full">
          <span className="text-sm text-P-neutral-400">PLACEHOLDER</span>
        </div>
      </div>
    </div>
  )
})

export const OverviewSection: React.FC = () => {
  // alpha:
  // py-24 sm:py-32 lg:py-40
  return (
    <div className="overflow-hidden bg-P-neutral-100 py-16 lg:py-24">
      <div className="relative mx-auto max-w-xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="relative">
          <h2 className="text-center text-3xl font-extrabold leading-8 tracking-tight text-P-heading sm:text-4xl">
            Our Controllers
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xl leading-7 text-P-neutral-600">
            <ProjectNameInline /> controllers can be any USB or Bluetooth input device that presents itself as a
            universal gamepad, mouse, or keyboard.
          </p>
          {/* <p className="mx-auto mt-4 max-w-3xl text-center text-xl text-gray-500">
            Joysticks, Touchscreens, Button Panels, Foot Pedals, Pressure Pads, and so much more!
          </p> */}
        </div>
        {/* tailwindui original mt-12 lg:mt-24 reduced to mt-16 */}
        <div className="relative mt-12 lg:mt-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="relative">
            <h3 className="text-2xl font-bold tracking-tight text-P-heading sm:text-3xl">Personalized input devices</h3>
            <p className="mt-3 text-lg text-P-neutral-600">
              Widely-available Joysticks, Touchscreens, Button Panels, Foot Pedals, Pressure Pads, Cameras, Gesture
              Sensors, and <em>so much more</em> enable highly personalized multi-input solutions.
            </p>

            <dl className="mt-10 space-y-10">
              {controllerFeatures.map((item) => (
                <div key={item.id} className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-P-background-contrast-bright text-white">
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg font-medium leading-6 text-P-subheading">{item.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-P-neutral-600">{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
            <SlideInAnimation animate="from-right">
              <ImagePlaceholder pbPercent={85} />
            </SlideInAnimation>
            {/* <img
              className="relative mx-auto"
              width={490}
              src="https://tailwindui.com/img/features/feature-example-1.png"
              alt=""
              // layout="fill" // added for next
              // objectFit="cover"
            /> */}
          </div>
        </div>

        {/* tailwindui original mt-12 lg:mt-24.... considered reducing to mt-16 but as its essentially a section keeping at 24 */}
        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="lg:col-start-2">
              <h3 className="text-2xl font-bold tracking-tight text-P-heading sm:text-3xl">Player Options</h3>
              <p className="mt-3 text-lg text-P-neutral-600">
                <ProjectNameInline /> works on computers, tablets, and smartphones that can run a modern web browser and
                support USB and/or bluetooth as required by your controller(s).
              </p>
              <dl className="mt-10 space-y-10">
                {communicationFeatures.map((item) => (
                  <div key={item.id} className="relative">
                    <dt>
                      <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-P-background-contrast-bright text-white">
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg font-medium leading-6 text-P-subheading">{item.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-P-neutral-600">{item.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative -mx-4 mt-10 lg:col-start-1 lg:mt-0">
              <AnimateOnIntersect
                from={{ transform: `translateY(50px) scale(0.5)`, opacity: 0 }}
                to={{ transform: `translateY(0px) scale(1)`, opacity: 1 }}
                threshold={0.6}
              >
                <ImagePlaceholder pbPercent={50} />
              </AnimateOnIntersect>

              {/* <img
                className="relative mx-auto"
                width={490}
                src="https://tailwindui.com/img/features/feature-example-2.png"
                alt=""
                // layout="fill" // added for next
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
