import type { Prisma } from '@prisma/client'
import { randEmail, randFullName, randLocale, randTimeZone } from '@ngneat/falso'

const mockProfile = {
  create: {
    locale: 'en-US',
    tz: '',
  },
}

export const usersData: Omit<Prisma.UserCreateInput, 'password'>[] = [
  {
    name: 'Empty',
    email: 'emtpy@example.com',
    profile: { ...mockProfile },
  },
  {
    name: 'Alice',
    email: 'alice@example.com',
    profile: { ...mockProfile },
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    profile: { ...mockProfile },
  },
  {
    name: 'Izzy',
    email: 'izzy@example.com',
    profile: { ...mockProfile },
  },
  ...Array(10)
    .fill(undefined)
    .map(() => ({
      name: randFullName(),
      email: randEmail(),
      profile: {
        create: {
          locale: randLocale(),
          tz: randTimeZone(),
        },
      },
    })),
]
