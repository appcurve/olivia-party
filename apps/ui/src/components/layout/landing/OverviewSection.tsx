import { ComputerDesktopIcon, DeviceTabletIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ProjectNameInline } from '../../brand/ProjectNameInline'
import { AiOutlineUsb as AiOutlineUsbIcon } from 'react-icons/ai'
import { BsController as BsControllerIcon } from 'react-icons/bs'
import Image from 'next/image'

const controllerFeatures = [
  {
    id: 1,
    name: 'Our guides make it easy',
    description:
      'Our buying guides and tutorials show you what to get and how to connect things to work as an OliviaParty controller.',
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
      'Mate your device to a monitor, touchscreen, TV, or even projector to provide your user with a large-format player experience.',
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

// the tailwindui original had the background dots to give some spacing

export const OverviewSection: React.FC = () => {
  return (
    <div className="overflow-hidden bg-P-neutral-100 py-16 lg:py-24">
      <div className="relative mx-auto max-w-xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="relative">
          <h2 className="text-center text-3xl font-extrabold leading-8 tracking-tight text-P-heading sm:text-4xl">
            Our Controllers
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-7 text-P-neutral-600">
            <ProjectNameInline /> controllers can be any input device or devices that connect to a computer via USB or
            Bluetooth and identify as a gamepad, mouse, or keyboard.
          </p>
          {/* <p className="mx-auto mt-4 max-w-3xl text-center text-xl text-gray-500">
            Joysticks, Touchscreens, Button Panels, Foot Pedals, Pressure Pads, and so much more!
          </p> */}
        </div>

        <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="relative">
            <h3 className="text-2xl font-bold tracking-tight text-P-heading sm:text-3xl">Personalized input devices</h3>
            <p className="mt-3 text-lg text-P-neutral-600">
              Readily-available Joysticks, Touchscreens, Button Panels, Foot Pedals, Pressure Pads, Cameras, Gesture
              Sensors, and so much more enable highly personalized input solutions.
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
            <img
              className="relative mx-auto"
              width={490}
              src="https://tailwindui.com/img/features/feature-example-1.png"
              alt=""
              // layout="fill" // added for next
              // objectFit="cover"
            />
          </div>
        </div>

        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="lg:col-start-2">
              <h3 className="text-2xl font-bold tracking-tight text-P-heading sm:text-3xl">Player Options</h3>
              <p className="mt-3 text-lg text-P-neutral-600">
                <ProjectNameInline /> can run on any computer, tablet and even retired smartphones that can support a
                modern browser plus USB and/or bluetooth interfaces as required by your controller.
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
              <img
                className="relative mx-auto"
                width={490}
                src="https://tailwindui.com/img/features/feature-example-2.png"
                alt=""
                // layout="fill" // added for next
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
