import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid'

import { ModalVariant, useModalContext } from '@firx/react-modals'
import { FormButton, FormInput } from '@firx/react-forms-rhf'
import type { CreatePhraseListDto, PhraseListDto, UpdatePhraseListDto } from '@firx/op-data-api'

import { ToolbarButton } from '../../elements/inputs/ToolbarButton'
import { ScrollableList } from '../../elements/lists/ScrollableList'

// regex to test for emoji's via unicode property escape
// @todo validate emojis as first step (phrase list form input)
// @todo implement an emoji picker or use one of the npm libraries (so far none found are ideal) as second step
// const emojiRegex = /\p{Emoji}/u

export interface PhraseListCreateFormProps {
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

const mapDtoToFormValues = (dto?: PhraseListDto): MutateFormValues =>
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
          'text-left text-sm leading-tight text-P-heading cursor-pointer',
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
        label="Menu Name"
        placeholder="Menu Name&hellip;"
        helperText="Name for this phrase in the user's phrase menu"
        autoComplete="off"
      />
      <FormInput
        name={context === 'standalone' ? 'emoji' : `phrases.${index}.emoji`}
        label="Emoji Icon"
        maxLength={1}
        placeholder="&hellip;"
        helperText="Single emoji character (optional)"
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
  values?: PhraseFormValues
  onSave: (formValues: PhraseFormValues) => void
}> = ({ values, onSave }) => {
  const hookForm = useForm<PhraseFormValues>({
    defaultValues: values ?? emptyFormValues['phrases'][0],
  })

  const { handleSubmit, reset } = hookForm

  const handleSave: SubmitHandler<PhraseFormValues> = (formValues) => {
    onSave(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleSave)} autoComplete="off" autoCorrect="off">
        <PhraseSubForm context="standalone" index={-1} />
        <FormButton type="submit" scheme="dark" appendClassName="mt-6">
          Save
        </FormButton>
      </form>
    </FormProvider>
  )
}

// const PhraseForm: React.FC = () => {
//   return <FormProvider {...hookForm}></FormProvider>
// }

// /**
//  * `DTO` should be set to either a 'create' or 'mutate' DTO (referred to as `CDTO` or `MDTO`
//  * in other type definitions within this project) as required.
//  *
//  * The `operation` prop (`OP` type) should be set to 'create' or 'mutate' depending on required operation.
//  * This property is for TS discriminated union.
//  */
// export interface PhraseListFormProps<DTO extends PhraseListDto, OP extends 'create' | 'update'> {
//   op: OP
//   //  OP extends 'create' | 'update'
//   // operation: OP
//   // dto?: OP extends 'update' ? object : never

//   data: OP extends 'update' ? DTO : never // DTO data
//   onSubmitAsync: (formValues: OperationFormValues<OP>) => Promise<void>
// }

// export type OperationFormValues<OP extends 'create' | 'update'> = OP extends 'create'
//   ? CreateFormValues
//   : OP extends 'update'
//   ? MutateFormValues
//   : never

// export function PhraseListForm<
//   DTO extends PhraseListDto,
//   // XDTO extends CreatePhraseListDto | UpdatePhraseListDto,
//   OP extends 'create' | 'update',
// >({ op, data, onSubmitAsync }: PhraseListFormProps<DTO, OP>): JSX.Element {
//   const initialValues: OperationFormValues<OP> | undefined = useMemo(
//     () => (op === 'create' ? emptyFormValues : op === 'update' ? mapDtoToFormValues(data) : undefined),
//     [op, data],
//   )

//   const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(-1)

//   const hookForm = useForm<OperationFormValues<OP>>({
//     defaultValues: initialValues,
//     shouldUnregister: false, // set to false if edit is done in a modal to avoid issues w/ unmount
//   })

//   const { handleSubmit, reset } = hookForm

//   const { fields, append, remove } = useFieldArray({
//     control: hookForm.control,
//     name: 'phrases',
//   })

// ...
// ...

export const PhraseListMutateForm: React.FC<PhraseListMutateFormProps> = ({ dto, onSubmitAsync }) => {
  const phraseListRef = useRef<HTMLUListElement>(null)

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(-1)
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

  const [showModal] = useModalContext(
    {
      title: 'Phrase',
      variant: ModalVariant.FORM,
    },
    (closeModal) => (
      <PhraseModalForm
        values={{
          label: hookForm.getValues(`phrases.${currentPhraseIndex}.label`),
          emoji: hookForm.getValues(`phrases.${currentPhraseIndex}.emoji`),
          phrase: hookForm.getValues(`phrases.${currentPhraseIndex}.phrase`),
        }}
        onSave={(formValues: PhraseFormValues): void => {
          const index = currentPhraseIndex

          if (!Object.values(formValues).every((v) => !v)) {
            hookForm.setValue(`phrases.${index}.label`, formValues.label)
            hookForm.setValue(`phrases.${index}.emoji`, formValues.emoji)
            hookForm.setValue(`phrases.${index}.phrase`, formValues.phrase)

            // scroll to bottom of ScrollableList where the new item is
            phraseListRef.current?.scroll({
              top: phraseListRef.current.scrollHeight,
              behavior: 'smooth',
            })
          } else {
            remove(index)
          }

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

  const handleSave: SubmitHandler<MutateFormValues> = async (formValues) => {
    await onSubmitAsync(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleSave)} className="w-full" autoComplete="off" autoCorrect="off">
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
            <ScrollableList ref={phraseListRef}>
              {fields.map((field, index) => {
                return (
                  <li key={field.id}>
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
            </ScrollableList>
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

export const PhraseListCreateForm: React.FC<PhraseListCreateFormProps> = ({ onSubmitAsync }) => {
  const phraseListRef = useRef<HTMLUListElement>(null)
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

  const [showModal] = useModalContext(
    {
      title: 'Phrase',
      variant: ModalVariant.FORM,
    },
    (closeModal) => (
      <PhraseModalForm
        values={{
          label: hookForm.getValues(`phrases.${currentPhraseIndex}.label`),
          emoji: hookForm.getValues(`phrases.${currentPhraseIndex}.emoji`),
          phrase: hookForm.getValues(`phrases.${currentPhraseIndex}.phrase`),
        }}
        onSave={(formValues: PhraseFormValues): void => {
          const index = currentPhraseIndex

          if (!Object.values(formValues).every((v) => !v)) {
            hookForm.setValue(`phrases.${index}.label`, formValues.label)
            hookForm.setValue(`phrases.${index}.emoji`, formValues.emoji)
            hookForm.setValue(`phrases.${index}.phrase`, formValues.phrase)

            // scroll to bottom of ScrollableList where the new item is
            phraseListRef.current?.scroll({
              top: phraseListRef.current.scrollHeight,
              behavior: 'smooth',
            })
          } else {
            remove(index)
          }

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

  const handleSave: SubmitHandler<CreateFormValues> = async (formValues) => {
    await onSubmitAsync(formValues)
    reset()
  }

  return (
    <FormProvider {...hookForm}>
      <form onSubmit={handleSubmit(handleSave)} className="w-full">
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
            {/* {fields.length === 1 && <PhraseSubForm context="fieldarray" index={0} />} */}
            <ScrollableList ref={phraseListRef}>
              {fields.map((field, index) => {
                // reminder: with rhf you must use getValues() vs. fields[index].label re lean towards uncontrolled inputs
                return (
                  <li key={field.id}>
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
            </ScrollableList>
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
