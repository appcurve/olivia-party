/**
 * Type of a compact universal identifier such as a **nanoid** or other similar type of
 * string identifier that is shorter and sweeter vs. a standard UUID.
 *
 * Supports use-cases related where high entropy and security are not strong requirements,
 * and/or there are other types of authentication/authorization in play (e.g. shortened URL's).
 */
export type Nid = string
