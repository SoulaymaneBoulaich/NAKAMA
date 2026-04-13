import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Dropping problematic tables...');
    try {
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "UserAnimeInteraction" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "WatchParty" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "AnimeRecommendation" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "GenreAffinity" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "StudioAffinity" CASCADE');
        console.log('Tables dropped successfully.');
    }
    catch (e) {
        console.error('Error dropping tables:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=scratch_cleanup.js.map