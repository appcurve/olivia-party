import { useEffect, useState } from 'react'

import type { FormOption } from '../types/form-option.interface'
import { FormListBox, type FormListBoxProps } from './FormListBox'

export interface FormTimeZoneListBoxProps extends Omit<FormListBoxProps, 'options'> {}

/**
 * Specialized listbox component for selecting timezones.
 *
 * @wip @todo complete FormTimeZoneListBox implementation.
 */
export const FormTimeZoneListBox: React.FC<FormTimeZoneListBoxProps> = ({ name, label, ...restProps }) => {
  const [timeZones, setTimeZones] = useState<FormOption[]>([])

  useEffect(() => {
    // @ts-expect-error the types for Intl are presently incomplete @see https://github.com/microsoft/TypeScript/issues/41338
    if (typeof Intl?.supportedValuesOf !== 'undefined') {
      setTimeZones(
        // @ts-expect-error the types for Intl are presently incomplete @see https://github.com/microsoft/TypeScript/issues/41338
        Intl?.supportedValuesOf('timeZone').map((tz) => ({
          value: tz,
          label: tz,
        })) ?? [],
      )
    }
  }, [])

  return <FormListBox name={name} label={label} options={timeZones} {...restProps}></FormListBox>
}
