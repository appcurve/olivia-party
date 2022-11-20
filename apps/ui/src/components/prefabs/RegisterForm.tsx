import { z } from 'zod'
import clsx from 'clsx'

import { zRegisterUser } from '@firx/op-data-api'
import {
  Form,
  FormInput,
  FormListBox,
  FormOption,
  getCountriesData,
  guessUserCountryFromBrowserTimezone,
  guessUserCurrencyFromCountry,
} from '@firx/react-forms-rhf'
import { Heading } from '../elements/headings/Heading'
import { useEffect, useMemo, useState } from 'react'

export interface RegisterFormValues extends z.infer<typeof zRegisterUser> {}

export interface RegisterFormProps {
  onSaveAsync: (formValues: RegisterFormValues) => Promise<void>
}

const defaultValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  playerUserName: '',
  playerUserYob: undefined,
  country: undefined,
  locale: 'en-US',
  timeZone: 'Etc/UTC',
  currency: undefined,
}

interface FormSectionDividerProps {
  heading: string
  caption?: string
  appendClassName?: string
}

const FormSectionDivider: React.FC<FormSectionDividerProps> = ({ heading, caption, appendClassName }) => {
  // considering an alternate style with bottom border divider: py-2 mb-1 border-b border-b-P-neutral-300
  return (
    <div className={clsx('not-first:mt-6', appendClassName)}>
      <h4 className="text-lg text-P-heading leading-6 font-normal tracking-tight">{heading}</h4>
      {!!caption && <p className="mt-1 text-sm text-P-neutral-500">{caption}</p>}
    </div>
  )
}

const getBirthYearOptions = (): FormOption[] => {
  const MAX_COUNT = 100
  const currentYear = new Date().getFullYear()

  return Array.from(new Array(MAX_COUNT), (_v, index) => {
    const year = currentYear - (index + 1)
    return {
      label: String(year),
      value: year,
    }
  })
}

const getCountryOptions = (): FormOption[] => {
  return Object.entries(getCountriesData())
    .map(([countryIso, countryName]) => ({
      label: countryName,
      value: countryIso,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const getCurrencyOptions = (): FormOption[] => {
  if (!Intl) {
    return []
  }

  const currencies: FormOption[] =
    // @ts-expect-error the types for Intl are presently incomplete @see https://github.com/microsoft/TypeScript/issues/41338
    Intl?.supportedValuesOf('currency').map((c) => ({
      value: c,
      label: c,
    })) ?? []

  return currencies.sort((a, b) => a.label.localeCompare(b.label))
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSaveAsync }) => {
  const [formDefaultValues, setFormDefaultValues] = useState<RegisterFormValues>(defaultValues)

  const birthYearOptions: FormOption[] = useMemo(() => getBirthYearOptions(), [])
  const countryOptions: FormOption[] = useMemo(() => getCountryOptions(), [])

  useEffect(() => {
    const resolvedDateTimeOptions = Intl.DateTimeFormat().resolvedOptions()

    setFormDefaultValues((current) => {
      const country = guessUserCountryFromBrowserTimezone({ format: 'iso' })
      const currency = guessUserCurrencyFromCountry(country)
      const currencyOptions = getCurrencyOptions()

      // safeguard to ensure the currency "guess" (based on ~ data) has a matching currency value in the listbox
      // the listbox is populated purely client-side via Intl.supportedValuesOf('currency')
      const result = currencyOptions.find((fx) => String(fx.value) === currency)

      return {
        ...current,
        country,
        currency: result ? currency : undefined,
        locale: resolvedDateTimeOptions.locale,
        timezone: resolvedDateTimeOptions.timeZone,
      }
    })
  }, [])

  return (
    <>
      <Heading type="h3" center>
        Create Account
      </Heading>
      <Form onSubmitForm={onSaveAsync} defaultValues={formDefaultValues} schema={zRegisterUser}>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <FormSectionDivider heading="Account Details" appendClassName="sm:col-span-6" />
          <FormInput name="name" label="Name" placeholder="Name" autoComplete="off" appendClassName="sm:col-span-3" />
          <FormListBox name="country" label="Country" options={countryOptions} appendClassName="sm:col-span-3" />
          <FormInput name="email" label="Email" autoComplete="off" appendClassName="sm:col-span-3" />
          <FormInput
            type="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            appendClassName="sm:col-span-3"
          />

          <FormSectionDivider
            heading="User Information"
            caption="Who is going to be the primary user of the OliviaParty player?"
            appendClassName="sm:col-span-6"
          />
          <FormInput
            name="playerUserName"
            label="User's Name"
            placeholder="Name"
            autoComplete="off"
            appendClassName="sm:col-span-3"
          />
          <FormListBox
            name="playerUserYob"
            label="Year of Birth"
            placeholder="Choose Year"
            options={birthYearOptions}
            appendClassName="sm:col-span-3"
          />

          <FormSectionDivider
            heading="Localization"
            caption="For displaying dates, time, numbers, and currencies in your local format:"
            appendClassName="sm:col-span-6"
          />
          <FormInput name="locale" label="Locale" appendClassName="sm:col-span-2" />
          <FormInput name="timezone" label="Timezone" appendClassName="sm:col-span-2" />
          <FormListBox
            name="currency"
            label="Currency"
            placeholder="Currency"
            options={getCurrencyOptions()}
            appendClassName="sm:col-span-2"
          />
        </div>
      </Form>
      <div className="sm:w-4/6 mx-auto my-8 rounded-md p-4 bg-P-neutral-50">
        <p className="text-sm text-center mx-auto max-w-sm text-P-heading">
          We do not share names, email addresses, or other personally identifying information with third-parties.
        </p>
      </div>
    </>
  )
}
