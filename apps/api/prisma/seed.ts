import { randMovieCharacter, randSuperheroName } from '@ngneat/falso'
import { BoxProfile, Prisma, PrismaClient, User, Video, VideoGroup } from '@prisma/client' // (revise path if using a custom output path in schema.prisma)
import { hash } from 'argon2'
import { getRandomIntFromRange, shuffle } from './lib/seed-utils'

import { generateBoxProfileData } from './seeds/generators/box-profiles'

import { usersData } from './seeds/users'
import { videosData } from './seeds/videos'

const INSECURE_SHARED_DEV_PASSWORD = 'passpass123'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log(`Start seeding ...`)

  const password = await hash(INSECURE_SHARED_DEV_PASSWORD)

  await prisma.user.deleteMany()
  console.log('Deleted records in user table.')

  await prisma.$queryRaw(Prisma.sql`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`)
  console.log('User table id sequence reset to 1')

  // save references to created objects for convenience to play with the seed data in dev
  const users: User[] = []
  const boxProfiles: BoxProfile[] = []
  const videos: Video[] = []
  const videoGroups: VideoGroup[] = []

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password,
      },
    })
    users.push(user)

    console.log(`Created user ${user.email} with id: ${user.id}`)

    // intentionally create no other data for our empty user
    if (userData.name === 'Empty') {
      continue
    }

    for (const _ of [...Array(getRandomIntFromRange(1, 3))]) {
      const boxProfile = await prisma.boxProfile.create({
        data: {
          ...(await generateBoxProfileData(user)),
        },
      })

      const userVideos: Video[] = []
      for (const videoData of videosData) {
        const video = await prisma.video.create({
          data: {
            ...videoData,
            boxProfile: {
              connect: {
                id: boxProfile.id,
              },
            },
          },
        })

        userVideos.push(video)
      }
      videos.push(...userVideos)

      // make 1-10 random playlists for this user
      for (const i of [...Array(getRandomIntFromRange(1, 10)).map((_, i) => i)]) {
        const playlist = await prisma.videoGroup.create({
          data: {
            name: `${randSuperheroName()} ${i} ${randMovieCharacter()}`,
            boxProfile: {
              connect: {
                id: boxProfile.id,
              },
            },
            // ...and fill them with 0-20 random videos
            videos: {
              create: shuffle(userVideos)
                .slice(0, getRandomIntFromRange(0, 20))
                .map((video) => ({
                  video: {
                    connect: {
                      id: video.id,
                    },
                  },
                })),
            },
          },
        })

        videoGroups.push(playlist)
      }

      boxProfiles.push(boxProfile)
    }
  }

  console.log(
    `Created ${boxProfiles.length} box profiles and ${videos.length} videos total organized into ${videoGroups.length} playlists`,
  )
}

main()
  .then(async () => {
    console.debug('Seeding complete.')
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
