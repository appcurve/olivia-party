import { z } from 'zod'
import { zUserFields_Sensitive } from '../user'
import { zUserProfileFields } from '../user-profile'

export const zRegisterUser = zUserProfileFields.merge(
  zUserFields_Sensitive.pick({ name: true, email: true, password: true }),
)

export interface RegisterUserDto extends z.infer<typeof zRegisterUser> {}
