export * from './lib/build-data-query-string'

// --------------------------------------------------------------------------------------------------------------------
// full-stack/e2e shared types and schema validation using zod
// --------------------------------------------------------------------------------------------------------------------

export * from './lib/schemas/common'
export * from './lib/schemas/errors/validation-errors'

export * from './lib/schemas/player/player'
export * from './lib/schemas/player/player-app'

export * from './lib/schemas/auth-user/user'
export * from './lib/schemas/auth-user/user-profile'
export * from './lib/schemas/auth-user/request/register-user'
export * from './lib/schemas/auth-user/request/change-password'

export * from './lib/schemas/op-apps/phrases/phrases'
export * from './lib/schemas/op-apps/videos/videos'

// --------------------------------------------------------------------------------------------------------------------
// mapper/transformer helper functions for integrating front-end + back-end libraries
// --------------------------------------------------------------------------------------------------------------------

export * from './lib/mappers/form-errors'

// --------------------------------------------------------------------------------------------------------------------
// zod schema helpers
// --------------------------------------------------------------------------------------------------------------------

export * from './lib/zod/converters'
export * from './lib/zod/processors'
export * from './lib/zod/z-password'
export * from './lib/zod/z-dates'
export * from './lib/zod/z-text'

// --------------------------------------------------------------------------------------------------------------------
// DTO types + interfaces (general)
// @todo migrate to zod
// --------------------------------------------------------------------------------------------------------------------

// export * from './types/dto/api.types'
// DTO types + interfaces (OliviaParty player) - @todo migrate to zod
// export * from './types/dto/player.types'
// export * from './types/dto/player-profile.types'
// export * from './types/dto/phrases.types'
// export * from './types/dto/videos.types'

// general types + interfaces
export * from './types/uid.type'
export * from './types/nid.type'
export * from './types/sort-type.type'
export * from './types/data-query-params.interface'

// utility types
export * from './types/required-identifier.type'
