// layout
export { FormContainer, type FormContainerProps } from './lib/components/FormContainer'

// project form wrapper for react-hook-form
export * from './lib/components/Form'

// essential inputs
export { FormInput, type FormInputProps } from './lib/components/FormInput'
export { FormTextArea, type FormTextAreaProps } from './lib/components/FormTextArea'
export { FormButton, type FormButtonProps } from './lib/components/FormButton'
export { FormSelectInput, type FormSelectInputProps } from './lib/components/FormSelectInput'

// form parent + form helper components in case they are required downstream
export * from './lib/components/Form'
export * from './lib/components/input-parts/FormInputErrors'
export * from './lib/components/input-parts/FormInputHelperText'
export * from './lib/components/input-parts/FormInputLabel'

// complex inputs (@todo some of these need style + react-hook-form learning curve improvements)
// re learning curve: objects only seem to be well supported when using FieldArray's
export { FormListBox, type FormListBoxProps } from './lib/components/FormListBox'
export { FormMultiComboBox, type FormMultiComboBoxProps } from './lib/components/FormMultiComboBox'
export { FormMultiListBox, type FormMultiListBoxProps } from './lib/components/FormMultiListBox'

// specialized inputs
export { FormTimeZoneListBox, type FormTimeZoneListBoxProps } from './lib/components/FormTimeZoneListBox'

// implementation helpers and associated data
export * from './lib/helpers/guess-country'
export * from './lib/helpers/guess-currency'
export * from './lib/helpers/data/countries'
export * from './lib/helpers/data/timezones'
export * from './lib/helpers/data/currencies'

// types
export * from './lib/types/form-element-common-props.interface'
export * from './lib/types/hook-form-component-props.interface'
export * from './lib/types/button-common-props.interface'
export * from './lib/types/form-option.interface'
