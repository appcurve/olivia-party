import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormButton, FormContainer, FormInput } from '@firx/react-forms-rhf'
import { Heading } from '../elements/headings/Heading'
import clsx from 'clsx'
import { mapApiValidationErrorToHookForm, zRegisterUser } from '@firx/op-data-api'
import { FormError } from '@firx/react-fetch'

// @future implement more detailed registration schema
// export const registerSchema = z
//   .object({
//     name: z.string().min(1),
//     email: z.string().email(),
//     password: z.string().min(8).max(128),
//     confirmPassword: z.string().min(8).max(128),
//     locale: z.string().min(2).max(8),
//     timezone: z.string().min(2).max(30),
//     currency: z.string().min(3).max(3),
//   })
//   .superRefine(({ password, confirmPassword }, ctx) => {
//     if (password !== confirmPassword) {
//       ctx.addIssue({
//         code: 'passwords_must_match',
//         message: 'The passwords do not match',
//       })
//     }
//   })

export interface RegisterFormValues extends z.infer<typeof zRegisterUser> {}

export interface RegisterFormProps {
  onSaveAsync: (formValues: RegisterFormValues) => Promise<void>
}

const defaultValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  // confirmPassword: '',
  locale: Intl.DateTimeFormat().resolvedOptions().locale,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: '',
}

interface FormSectionDividerProps {
  heading: string
  caption?: string
  appendClassName?: string
}

const FormSectionDivider: React.FC<FormSectionDividerProps> = ({ heading, caption, appendClassName }) => {
  // py-2 mb-1 border-b border-b-P-neutral-300
  return (
    <div className={clsx('mt-6', appendClassName)}>
      <h4 className="text-lg text-P-heading leading-6 font-normal tracking-tight">{heading}</h4>
      {!!caption && <p className="mt-1 text-sm text-P-neutral-500">{caption}</p>}
    </div>
  )
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSaveAsync }) => {
  const hookForm = useForm<RegisterFormValues>({
    defaultValues,
    criteriaMode: 'all', // validate entire form and enable display multiple errors
    // @temp to test server-side errors // @todo uncomment this line resolver: zodResolver(zRegisterUser),
  })

  const {
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = hookForm

  const handleSaveAsync: SubmitHandler<RegisterFormValues> = async (formValues) => {
    try {
      await onSaveAsync(formValues)
      reset()
    } catch (error: unknown) {
      if (error instanceof FormError) {
        mapApiValidationErrorToHookForm<RegisterFormValues>(error.getData(), { criteriaMode: 'all' }).forEach(
          ([name, err]) => setError(name, err),
        )
      }
    }
  }

  return (
    <FormProvider {...hookForm}>
      {errors && !!Object.keys(errors).length && (
        <div className="bg-pink-100 py-4 rounded-md">
          <pre>{String(errors)}</pre>
        </div>
      )}

      <FormContainer>
        <Heading type="h3" center>
          Create Account
        </Heading>
        <form onSubmit={handleSubmit(handleSaveAsync)} autoComplete="off" autoCorrect="off">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            <FormSectionDivider heading="Account Details" appendClassName="sm:col-span-6" />
            <FormInput name="name" label="Name" placeholder="Name" autoComplete="off" appendClassName="sm:col-span-3" />
            <FormInput name="email" label="Email" autoComplete="off" appendClassName="sm:col-span-3" />
            <FormInput
              type="password"
              name="password"
              label="Password"
              autoComplete="off"
              appendClassName="sm:col-span-3"
              helperText="I am a teapot short and stout"
            />
            {/* <FormInput
              type="password"
              name="confirmPassword"
              label="Repeat Password"
              autoComplete="off"
              appendClassName="sm:col-span-3"
            /> */}

            <FormSectionDivider
              heading="User Information"
              caption="Who is going to use the OliviaParty player?"
              appendClassName="sm:col-span-6"
            />
            <FormInput
              name="userName"
              label="User's Name"
              placeholder="Name"
              autoComplete="off"
              appendClassName="sm:col-span-3"
            />
            <div />

            <FormSectionDivider
              heading="Localization"
              caption="This information helps us display numbers, dates, times, and currencies in your local format."
              appendClassName="sm:col-span-6"
            />
            <FormInput name="locale" label="Locale" appendClassName="sm:col-span-2" />
            <FormInput name="timezone" label="Timezone" appendClassName="sm:col-span-2" />
            <FormInput name="currency" label="Currency" appendClassName="sm:col-span-2" />

            {/* <FormSectionDivider
              heading="Location"
              // caption="Help us choose smart defaults for users, configure future location-aware apps like maps, and inform our project roadmap."
              appendClassName="sm:col-span-6"
            />
            <FormListBox
              name="country"
              label="Country"
              options={[
                { value: 'CA', label: 'Canada' },
                { value: 'US', label: 'USA' },
                { value: 'UK', label: 'UK' },
              ]}
              appendClassName="sm:col-span-3"
            />

            <FormListBox
              name="stateprov"
              label="State/Province"
              options={[
                { value: 'CA', label: 'Canada' },
                { value: 'US', label: 'USA' },
                { value: 'UK', label: 'UK' },
              ]}
              appendClassName="sm:col-span-3"
            />
            <FormInput name="city" label="City" appendClassName="sm:col-span-3" />
            <FormInput name="postalZip" label="Postal/Zip Code" appendClassName="sm:col-span-3" /> */}

            <div className="">
              <FormButton type="submit" scheme="dark" appendClassName="mt-6">
                Save
              </FormButton>
            </div>
            <div />
          </div>
        </form>
        <p className="text-sm text-center mx-auto max-w-sm text-P-heading">
          We do not share names, email addresses, or any other personally identifying information with third-parties.
        </p>
      </FormContainer>
    </FormProvider>
  )
}
