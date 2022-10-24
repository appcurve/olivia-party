import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid'

import type { CreatePhraseListDto, PhraseListDto, UpdatePhraseListDto } from '@firx/op-data-api'
import { FormButton, FormInput } from '@firx/react-forms-rhf'
import { ToolbarButton } from '../../elements/inputs/ToolbarButton'
import { ModalVariant, useModalContext } from '@firx/react-modals'
import { useEffect, useMemo, useState } from 'react'

export interface PhraseListFormProps {
  // emptyFormValues: DTO
  onSubmitAsync: (formValues: CreatePhraseListDto) => Promise<void>
}

export interface PhraseListMutateFormProps {
  // emptyFormValues: DTO
  dto: PhraseListDto
  onSubmitAsync: (formValues: UpdatePhraseListDto) => Promise<void>
}

interface CreateFormValues extends CreatePhraseListDto {}
interface MutateFormValues extends UpdatePhraseListDto {}

// pull type from PhraseListDto as it references the current/up-to-date PhraseDto<version> generic
type PhraseFormValues = PhraseListDto['phrases'][number]

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

const mapDtoToFormValues = (dto?: PhraseListDto): MutateFormValues | undefined =>
  dto
    ? {
        name: dto.name,
        phrases: dto.phrases ?? emptyFormValues.phrases,
      }
    : emptyFormValues

// const InnerForm: React.FC<{ onSubmit: React.FormEventHandler<HTMLFormElement> }> = ({ onSubmit }) => {
//   return <></>
// }

// @future setup forms implemented as generic components?
// type PhraseListFormComponent<T extends object> = React.FC<PhraseListFormProps<T>>
// export const PhraseListForm = <FV extends object>({}: PhraseListFormProps<FV>) => {...}

// export const PhraseListForm: React.FC<PhraseListFormProps> = ({ onSubmitAsync }) => {

interface PhraseProps {
  index: number
  dto: PhraseListDto['phrases'][number]
  hideDelete?: boolean
  onEditClick?: (index: number) => void
  onDeleteClick?: (index: number) => void
}

const Phrase: React.FC<PhraseProps> = ({ dto, index, hideDelete, onEditClick, onDeleteClick }) => {
  return (
    <div
      className={clsx(
        'flex items-center [&>*]:p-2 rounded-md border transition-colors border-P-neutral-200 bg-white hover:bg-P-focus-light',
      )}
    >
      <button
        type="button"
        className={clsx(
          'flex-1',
          'text-left text-sm leading-tight text-P-heading capitalize cursor-pointer',
          'focus:rounded-l-md fx-focus-ring',
        )}
        onClick={typeof onEditClick === 'function' ? (): void => onEditClick(index) : undefined}
      >
        <div className="font-medium mb-1">
          {dto.emoji} {dto.label}
        </div>
        <div className="text-P-subheading">&ldquo;{dto.phrase}&rdquo;</div>
      </button>
      {typeof onDeleteClick === 'function' && !hideDelete && (
        <div className="">
          <ToolbarButton
            a11y={{ label: 'Delete Phrase' }}
            SvgIcon={XMarkIcon}
            onClick={(): void => onDeleteClick(index)}
          />
        </div>
      )}
    </div>
  )
}

interface PhraseSubFormProps {
  context: 'standalone' | 'fieldarray'
  index: number
}

const PhraseSubForm: React.FC<PhraseSubFormProps> = ({ context, index }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FormInput
        name={context === 'standalone' ? 'label' : `phrases.${index}.label`}
        label="Menu Label"
        placeholder="Menu Label&hellip;"
        helperText="Displayed in the user's phrase menu"
      />
      <FormInput
        name={context === 'standalone' ? 'emoji' : `phrases.${index}.emoji`}
        label="Emoji Icon"
        placeholder="&hellip;"
        helperText="Displayed in the user's phrase menu beside label"
      />
      <FormInput
        name={context === 'standalone' ? 'phrase' : `phrases.${index}.phrase`}
        label="Phrase"
        placeholder="Phrase for text-to-speech to read out"
        appendClassName="sm:col-span-2"
      />
    </div>
  )
}

export const PhraseModalForm: React.FC<{
  onSave: (formValues: PhraseFormValues) => void
}> = ({ onSave }) => {
  const hookForm = useForm<PhraseFormValues>({
    defaultValues: emptyFormValues['phrases'][0],
  })

  const { handleSubmit, reset } = hookForm

  const handleSave: SubmitHandler<PhraseFormValues> = (formValues) => {
    onSave(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleSave)}>
        <PhraseSubForm context="standalone" index={-1} />
        <FormButton type="submit" scheme="dark" appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}

/** Basic form (not react-hook-form). */
// const PhraseForm: React.FC<PhraseSubFormProps> = ({ index }) => {
//   return (
//     <>
//       <input
//         name={`phrases.${index}.label`}
//         placeholder="Menu Label&hellip;"
//       />
//       <input
//         name={`phrases.${index}.emoji`}
//         placeholder="&hellip;"
//       />
//       <input
//         name={`phrases.${index}.phrase`}
//       />
//       <button type="button">

//       </button>
//     </>
//   )
// }

// const PhraseForm: React.FC = () => {
//   return <FormProvider {...hookForm}></FormProvider>
// }

export const PhraseListMutateForm: React.FC<PhraseListMutateFormProps> = ({ dto, onSubmitAsync }) => {
  const initialValues = useMemo(() => mapDtoToFormValues(dto), [dto])

  const hookForm = useForm<MutateFormValues>({
    defaultValues: initialValues,
  })

  const { handleSubmit, reset } = hookForm

  useEffect(() => {
    reset(initialValues)
  }, [reset, initialValues])

  const { fields, append, remove } = useFieldArray({
    control: hookForm.control,
    name: 'phrases',
  })

  // mapDtoToFormValues

  const handleSaveFormValues: SubmitHandler<MutateFormValues> = async (formValues) => {
    await onSubmitAsync(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleSaveFormValues)} className="w-full">
        <div>
          <FormInput
            name="name"
            label="List Name"
            placeholder="List Name"
            validationOptions={{ required: true }}
            appendClassName="mb-4"
          />
          <div className="text-sm text-P-form-input-label mb-1.5">Phrases</div>
          <ul
            className={clsx(
              'grid grid-cols-1 gap-2 py-2 pl-2 pr-0.5 rounded-md',
              'fx-scrollbar overflow-y-scroll',
              'border-P-neutral-300 border max-h-[30vh]',
            )}
          >
            {fields.map((field, index) => {
              return (
                <li key={field.id}>
                  <Phrase
                    index={index}
                    dto={field}
                    hideDelete={fields.length === 1}
                    onDeleteClick={(): void => remove(index)}
                  />

                  {/* <input type="hidden" {...hookForm.register(`phrases.${index}.label`)} />
                  <input type="hidden" {...hookForm.register(`phrases.${index}.emoji`)} />
                  <input type="hidden" {...hookForm.register(`phrases.${index}.phrase`)} />
                  <div>label: {fields[index].label}</div>
                  <button type="button" onClick={(): void => showPhraseModal(index)}>
                    Edit Phrase
                  </button> */}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="flex justify-end">
          <ToolbarButton
            type="button"
            SvgIcon={PlusIcon}
            caption="Add Phrase"
            appendClassName="mt-3"
            onClick={(): void => {
              append(emptyFormValues.phrases)
            }}
          />
        </div>
        <FormButton type="submit" scheme="dark" appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}

// export const PhraseListForm = <DTO extends object>({ onSubmitAsync }: PhraseListFormProps<DTO>) => {
export const PhraseListForm: React.FC<PhraseListFormProps> = ({ onSubmitAsync }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(-1)

  const hookForm = useForm<CreateFormValues>({
    defaultValues: emptyFormValues,
    shouldUnregister: false, // set to false if edit is done in a modal to avoid issues w/ unmount
  })

  const { handleSubmit, reset } = hookForm

  const { fields, append, remove } = useFieldArray({
    control: hookForm.control,
    name: 'phrases',
  })

  console.log(`current phrase index: ${currentPhraseIndex}`)

  const [showModal] = useModalContext(
    {
      title: 'Phrase',
      variant: ModalVariant.FORM,
    },
    (closeModal) => (
      <PhraseModalForm
        onSave={(formValues: PhraseFormValues): void => {
          const index = currentPhraseIndex
          hookForm.setValue(`phrases.${index}.label`, formValues.label)
          hookForm.setValue(`phrases.${index}.emoji`, formValues.emoji)
          hookForm.setValue(`phrases.${index}.phrase`, formValues.phrase)
          setCurrentPhraseIndex(-1)
          closeModal()
        }}
      />
    ),
    [currentPhraseIndex],
  )

  const showPhraseModal = (index: number): void => {
    setCurrentPhraseIndex(index)
    showModal()
  }

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
            <ul className="grid grid-cols-1 gap-2">
              {fields.length === 1 && <PhraseSubForm context="fieldarray" index={0} />}

              {fields.map((field, index) => {
                // with rhf you must use getValues() vs. fields[index].label as it won't refresh after modal setValue
                return (
                  <li key={field.id} className={clsx('')}>
                    <div className="flex-1 grid grid-cols-1 gap-1">
                      <Phrase
                        index={index}
                        dto={{
                          label: hookForm.getValues(`phrases.${index}.label`),
                          emoji: hookForm.getValues(`phrases.${index}.emoji`),
                          phrase: hookForm.getValues(`phrases.${index}.phrase`),
                        }}
                        hideDelete={fields.length === 1}
                        onEditClick={(): void => showPhraseModal(index)}
                        onDeleteClick={remove}
                      />
                      <input type="hidden" {...hookForm.register(`phrases.${index}.label`)} />
                      <input type="hidden" {...hookForm.register(`phrases.${index}.emoji`)} />
                      <input type="hidden" {...hookForm.register(`phrases.${index}.phrase`)} />
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
                showPhraseModal(fields.length)
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
