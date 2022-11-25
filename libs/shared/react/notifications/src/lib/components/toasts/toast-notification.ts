import toast from 'react-hot-toast'

/**
 * Project wrapper of react-hot-toast's `toast()` function.
 *
 * Created to provide a layer of indirection and support future customization.
 * Use this function within the project to trigger toast notification popovers vs. using `toast()` directly.
 */
export const toastNotification = toast

// reminder - if extending w/ the following approach you need to also add on the .success, .error, etc. functions:
// (...args: Parameters<typeof toast>): string => toast(...args)
