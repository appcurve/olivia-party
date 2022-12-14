import { randMovieCharacter, randSuperheroName } from '@ngneat/falso'
import { Player, PhraseList, Prisma, PrismaClient, User, Video, VideoPlaylist } from '@prisma/client' // (revise path if using a custom output path in schema.prisma)
import { hash } from 'argon2'
import { getRandomIntFromRange, shuffle } from './lib/seed-utils'

import { generatePlayerData } from './seeds/generators/player-profiles'
import { phraseListsData } from './seeds/phrases'

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
  const players: Player[] = []
  const phraseLists: PhraseList[] = []
  const videos: Video[] = []
  const videoPlaylists: VideoPlaylist[] = []

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
      const player = await prisma.player.create({
        data: {
          ...(await generatePlayerData(user)),
        },
      })

      const userPhraseLists: PhraseList[] = []
      for (const phraseListData of phraseListsData) {
        const phraseList = await prisma.phraseList.create({
          data: {
            ...phraseListData,
            player: {
              connect: {
                id: player.id,
              },
            },
          },
        })
        userPhraseLists.push(phraseList)
      }
      phraseLists.push(...phraseLists)

      const userVideos: Video[] = []
      for (const videoData of videosData) {
        const video = await prisma.video.create({
          data: {
            ...videoData,
            player: {
              connect: {
                id: player.id,
              },
            },
          },
        })

        userVideos.push(video)
      }
      videos.push(...userVideos)

      // make 1-10 random playlists for this user
      for (const i of [
        ...Array(getRandomIntFromRange(1, 10))
          .fill(undefined)
          .map((_, i) => i),
      ]) {
        const playlist = await prisma.videoPlaylist.create({
          data: {
            name: `${randSuperheroName()} ${i + 1} ${randMovieCharacter()}`,
            player: {
              connect: {
                id: player.id,
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

        videoPlaylists.push(playlist)
      }

      players.push(player)
    }
  }

  console.log(
    `Created ${players.length} box profiles and ${videos.length} videos total organized into ${videoPlaylists.length} playlists PLUS ${phraseLists.length} phraselists`,
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
