import { PrismaClient, AnimeStatus, CommunityRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import "dotenv/config"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'spike@bebop.com' },
    update: {},
    create: {
      username: 'Spike Spiegel',
      email: 'spike@bebop.com',
      passwordHash,
      bio: 'Whatever happens, happens.',
      avatar: 'https://img.betaseries.com/T0b_D-7_v-v-v-v-v-v-/https%3A%2F%2Fbetaseries.com%2Fapi%2Fv1%2Fmembers%2F205869.jpg',
      privacySettings: {
        create: {
          showStats: true,
          showTopTen: true,
        }
      }
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'faye@bebop.com' },
    update: {},
    create: {
      username: 'Faye Valentine',
      email: 'faye@bebop.com',
      passwordHash,
      bio: 'The past is only the past.',
      avatar: 'https://img.betaseries.com/T0b_D-7_v-v-v-v-v-v-/https%3A%2F%2Fbetaseries.com%2Fapi%2Fv1%2Fmembers%2F205870.jpg',
      privacySettings: {
        create: {
          showActivity: true,
          showCommunities: true,
        }
      }
    },
  })

  // Create a Community
  const community = await prisma.community.upsert({
    where: { slug: 'cowboy-bebop-fans' },
    update: {},
    create: {
      name: 'Cowboy Bebop Fans',
      slug: 'cowboy-bebop-fans',
      description: 'See You Space Cowboy...',
      category: 'Anime',
      members: {
        create: [
          { userId: user1.id, role: CommunityRole.ADMIN },
          { userId: user2.id, role: CommunityRole.MEMBER },
        ]
      }
    }
  })

  // Create some Top Ten Entries for User 1
  await prisma.topTenEntry.createMany({
    data: [
      { userId: user1.id, animeId: '1', animeTitle: 'Cowboy Bebop', rank: 1, animeCover: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg' },
      { userId: user1.id, animeId: '2904', animeTitle: 'Code Geass', rank: 2, animeCover: 'https://cdn.myanimelist.net/images/anime/5/50331.jpg' },
    ]
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
