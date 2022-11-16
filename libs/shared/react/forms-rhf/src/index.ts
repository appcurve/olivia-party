// layout
export { FormContainer, type FormContainerProps } from './lib/components/FormContainer'

// project form wrapper for react-hook-form
export * from './lib/components/Form'

// essential inputs
export { FormInput, type FormInputProps } from './lib/components/FormInput'
export { FormTextArea, type FormTextAreaProps } from './lib/components/FormTextArea'
export { FormButton, type FormButtonProps } from './lib/components/FormButton'
export { FormSelectInput, type FormSelectInputProps } from './lib/components/FormSelectInput'

// form parts helper components
export * from './lib/components/input-parts/FormInputErrors'
export * from './lib/components/input-parts/FormInputHelperText'

// complex inputs (@todo some of these need style + react-hook-form learning curve improvements)
// re learning curve: objects only seem to be well supported when using FieldArray's
export { FormListBox, type FormListBoxProps } from './lib/components/FormListBox'
export { FormMultiComboBox, type FormMultiComboBoxProps } from './lib/components/FormMultiComboBox'
export { FormMultiListBox, type FormMultiListBoxProps } from './lib/components/FormMultiListBox'

// specialized inputs
export { FormTimeZoneListBox, type FormTimeZoneListBoxProps } from './lib/components/FormTimeZoneListBox'

// types
export * from './lib/types/button-common-props.interface'
export * from './lib/types/form-element-common-props.interface'
export * from './lib/types/form-option.interface'
