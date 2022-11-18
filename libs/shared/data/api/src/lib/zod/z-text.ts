import { z } from 'zod'

/**
 * Zod - Optional text field that treats empty values as `undefined`.
 * Internally implements a preprocessing step that trims the value and converts falsey values to `undefined`.
 */
export const zOptionalText = z.preprocess((val) => String(val).trim() || undefined, z.string().optional()).optional()
