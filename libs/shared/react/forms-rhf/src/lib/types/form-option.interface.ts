export interface FormOption {
  value: string | number
  label: string
  disabled?: boolean

  /**
   * Optionally specify a unique value for React `key` for this FormOption in case there is a risk of
   * collision with the defafult Form* component behavior.
   */
  keyValue?: string
}
