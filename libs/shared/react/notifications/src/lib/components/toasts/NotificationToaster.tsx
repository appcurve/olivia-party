import React from 'react'
import { Toaster, type ToasterProps } from 'react-hot-toast'
import { CustomToastBar } from './CustomToastBar'

export interface ToasterNotificationProps extends ToasterProps {}

// reminder: if extending w/ the following approach you'd need to hang all the .success, .error, etc. functions
// (...args: Parameters<typeof toast>): string => toast(...args)

/**
 * Custom "Toaster" component for the react-hot-toast notification library.
 *
 * This component is a drop-in replacement for the default `Toaster` exported by the library that sets
 * project-specific options and renders toasts with custom transitions + styling that reflect the project.
 *
 * Any provided `ToasterProps` will override the defaults set by this component.
 *
 * Usage:
 * - Add this component somewhere near the top of the react component tree.
 * - To create a toast notification in the project import the `toastNotification()` function from this lib
 *   and call it with your notification message. Refer to docs for for `.success()`, `.error()`, etc. options.
 *
 * @see {@link https://react-hot-toast.com/docs}
 * @see {@link https://react-hot-toast.com/docs/version-2}
 */
export const NotificationToaster: React.FC<ToasterProps> = (props) => (
  <Toaster
    position="top-right"
    // refer to CustomToaster for aria (`ariaProps` option is [presumably] only functional with ToastBar)
    toastOptions={{
      duration: 3000,
      success: {
        duration: 2000,
      },
      error: {
        duration: 6000,
      },
      loading: {
        duration: 2000,
      },
    }}
    {...props}
  >
    {(t): JSX.Element => (
      <CustomToastBar t={t} />

      // note: if a wrapping ToastBar is used it seems to omit the headlessui Transition in the CustomToastBar
      // regardless of component react-hot-toast will still apply its own transitions for handling multiple toasts
      //
      // <ToastBar style={{}} toast={t}>
      //   {({ icon, message }): JSX.Element => (
      //     <CustomToastBar ... />
      //   )}
      // </ToastBar>
    )}
  </Toaster>
)
