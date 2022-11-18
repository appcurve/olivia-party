import { z } from 'zod'
import { User } from '@prisma/client'
import { zDate } from '../../zod/z-dates'
import { zBaseEntity } from '../common'

export interface UserDto extends Pick<User, 'email' | 'name'> {}

export const zUser = zBaseEntity.merge(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    verifiedAt: zDate.nullable(),
    password: z.string(),
    refreshToken: z.string(),
  }),
)

export const zSanitizedUser = zUser.pick({ uuid: true, name: true, email: true, verifiedAt: true })

export interface SanitizedUserDto extends z.infer<typeof zSanitizedUser> {}
