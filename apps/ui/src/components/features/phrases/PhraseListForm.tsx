import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid'

import type { CreatePhraseListDto, PhraseListDto, UpdatePhraseListDto } from '@firx/op-data-api'
import { FormButton, FormInput } from '@firx/react-forms-rhf'
import { ToolbarButton } from '../../elements/inputs/ToolbarButton'

export interface PhraseListFormProps {
  onSubmitAsync: (formValues: CreatePhraseListDto) => Promise<void>
}

interface CreateFormValues extends CreatePhraseListDto {}
// interface MutateFormValues extends UpdatePhraseListDto {}

const emptyFormValues: CreateFormValues = {
  name: '',
  phrases: [
    {
      label: '',
      phrase: '',
      emoji: '',
    },
  ],
}

// const mapDtoToFormValues = (dto?: PhraseListDto): MutateFormValues | undefined =>
//   dto
//     ? {
//         name: dto.name,
//         phrases: dto.phrases ?? emptyFormValues.phrases,
//       }
//     : emptyFormValues

// const InnerForm: React.FC<{ onSubmit: React.FormEventHandler<HTMLFormElement> }> = ({ onSubmit }) => {
//   return <></>
// }

// @future setup forms implemented as generic components?
// type PhraseListFormComponent<T extends object> = React.FC<PhraseListFormProps<T>>
// export const PhraseListForm = <FV extends object>({}: PhraseListFormProps<FV>) => {...}

export const PhraseListForm: React.FC<PhraseListFormProps> = ({ onSubmitAsync }) => {
  const hookForm = useForm<CreateFormValues>({
    defaultValues: emptyFormValues,
    // shouldUnregister: false, // set to false if edit is done in a modal to avoid issues w/ unmount
  })

  const { fields, append, remove } = useFieldArray({
    control: hookForm.control,
    name: 'phrases',
  })

  const { handleSubmit, reset } = hookForm

  const handleCreate: SubmitHandler<CreateFormValues> = async (formValues) => {
    await onSubmitAsync(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleCreate)} className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="List Name"
            validationOptions={{ required: true }}
            appendClassName="sm:col-span-2"
          />
          <fieldset className="sm:col-span-2">
            <legend className="text-sm mb-2 group-focus-within:font-medium group-focus-within:text-P-form-input-label-focus">
              Phrases
            </legend>
            <ul className="grid grid-cols-1 gap-2 xs:gap-4">
              {fields.map((field, index) => {
                return (
                  <li
                    key={field.id}
                    className={clsx('flex items-center p-4 rounded-md border border-P-neutral-200 bg-P-neutral-50/90')}
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4">
                      <FormInput
                        name={`phrases.${index}.label`}
                        label="Menu Label"
                        placeholder="Menu Label&hellip;"
                        helperText="Displayed in the user's phrase menu"
                      />
                      <FormInput
                        name={`phrases.${index}.emoji`}
                        label="Emoji Icon"
                        placeholder="&hellip;"
                        helperText="Displayed in the user's phrase menu beside label"
                      />
                      <FormInput
                        name={`phrases.${index}.phrase`}
                        label="Phrase"
                        placeholder="Phrase for text-to-speech to read out"
                        appendClassName="col-span-2"
                      />
                      <div className="flex justify-end col-span-2">
                        <ToolbarButton
                          a11y={{ label: 'Delete Phrase' }}
                          caption="Delete Phrase"
                          disabled={fields.length === 1}
                          SvgIcon={XMarkIcon}
                          onClick={(): void => remove(index)}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </fieldset>
          <div />
          <div className="flex justify-end pr-4">
            <ToolbarButton
              type="button"
              SvgIcon={PlusIcon}
              caption="Add Phrase"
              onClick={(): void => {
                append(emptyFormValues.phrases)
              }}
            />
          </div>
        </div>
        <FormButton type="submit" scheme="dark" appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}
