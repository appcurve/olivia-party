import { ApiDataObject } from '../dto/api.types'

/**
 * Generic type utility that ensures the given `DTO` has a required `uuid` property.
 *
 * @see ApiDataObject
 */
export type RequiredIdentifier<DTO extends object> = Required<ApiDataObject> & Omit<DTO, 'uuid'>
