/**
 * Type of a heterogenous universal identifier (UID) that can represent either a
 * UUIDv4 (`string`) or a serial integer ID (`number`) per project convention.
 *
 * Supports use-cases related to data models that have both of these identifiers.
 */
export type Uid = string | number
