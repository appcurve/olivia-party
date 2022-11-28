import type { RegisterOptions } from 'react-hook-form'

/**
 * Common props of "element" `Form*`-name-prefixed components integrated with react-hook-form.
 * The term "element" in this context refers to basic inputs: text inputs, textarea, etc. vs. "rich" form components.
 */
export interface FormElementCommonProps {
  /**
   * Element name used to register the input with react-hook-form.
   */
  name: string

  /**
   * Input label. This value is also used for a11y attributes including in cases where the `showLabel` prop is `false`.
   */
  label: string

  /**
   * Small helper text to render below the input for providing additional information or instructions to the user.
   */
  helperText?: string

  // /**
  //  * Disable this input and show its defaultValue (as may be set via react-hook-form).
  //  */
  // readOnly?: boolean

  /**
   * Control visual appearance/animation and potentially pointer-events in loading/submitting states.
   */
  isLoading?: boolean

  /**
   * Control visual display of the input's label (default: `true`). This value is used for a11y and will be
   * rendered for screen-readers only if this prop is set to `false`.
   */
  showLabel?: boolean

  /**
   * Control visual display of error feedback (if there is any for this field; default: `true`).
   * Applicable to cases where a parent or alternative UI element is displaying errors instead.
   *
   * This prop does not disable error validation and aria attributes will be set in case of a validation issue.
   */
  showErrorMessage?: boolean

  /**
   * Manual validation rules to pass to react-hook-form as `RegisterOptions`.
   * Validation via zod schema is the recommended alternative for this project.
   */
  validationRules?: RegisterOptions

  /**
   * Append className to this component's parent element.
   *
   * Intended for adding margins, child behavior as a flex/grid item, etc. Not intended for setting the
   * visual styling of the element itself as it has its own styling and this may lead to conflicts.
   */
  appendClassName?: string
}
