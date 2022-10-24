import type { UserProfile } from '@prisma/client'

export interface UserProfileDto extends Pick<UserProfile, 'bio' | 'locale' | 'tz'> {}
