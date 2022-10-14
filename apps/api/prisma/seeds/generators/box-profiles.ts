import type { Prisma, User } from '@prisma/client'
import { nanoid } from 'nanoid/async'

import { getRandomItem } from '../../lib/seed-utils'

const names = ['My DIY Device', 'Custom Device', 'Living Room', 'Bedroom', 'Wheelchair Mounted Box']

export const generateBoxProfileData = async (user: User): Promise<Prisma.BoxProfileCreateInput> => {
  const urlCode = await nanoid(10)

  return {
    name: getRandomItem(names),
    urlCode,
    user: {
      connect: {
        id: user.id,
      },
    },
  }
}
