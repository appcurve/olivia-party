import { ApiDto } from '../lib/schemas/common'

/**
 * Generic type utility that ensures the given `DTO` has a required `uuid` property.
 * @see ApiDto
 */
export type RequiredIdentifier<DTO extends object> = Required<ApiDto> & Omit<DTO, 'uuid'>
