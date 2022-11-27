/**
 * Base URL of this UI as currently deployed.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_PROJECT_BASE_URL ?? ''

/**
 * Base URL of this UI's primary back-end API as currently deployed.
 * Note both production and development deployments of this project reverse-proxy the /api path to the back-end API.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL ?? ''

/**
 * URL of the player app.
 */
export const PLAYER_URL = process.env.NEXT_PUBLIC_PROJECT_PLAYER_URL ?? ''
