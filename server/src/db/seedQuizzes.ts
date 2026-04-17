import { prisma } from '../lib/prisma.js';
import { questions } from './questions.js';

async function seed() {
    try {
        console.log('--- SEEDING ANIQUIZ ---');
        
        // 1. Create a Default Seasonal Quiz
        const seasonalQuiz = await prisma.quiz.create({
            data: {
                title: 'Spring 2026 Season Opener',
                description: 'Test your knowledge on the latest seasonal manifestations.',
                category: 'QA',
                difficulty: 'CHUNIN',
                isGauntlet: false
            }
        });

        // 2. Insert Questions
        for (const q of questions) {
            await prisma.question.create({
                data: {
                    ...q as any,
                    quizId: seasonalQuiz.id
                }
            });
        }

        console.log(`Successfully seeded ${questions.length} questions into "${seasonalQuiz.title}"`);
        
        // 3. Create a Gauntlet Quiz Record (Global)
        await prisma.quiz.upsert({
            where: { id: 'GAUNTLET_WEEKLY' },
            create: {
                id: 'GAUNTLET_WEEKLY',
                title: 'The Eternal Gauntlet',
                description: '100 Questions. 5 Mistakes max. Become a Nakama Leader.',
                category: 'QA',
                difficulty: 'LEGENDARY',
                isGauntlet: true
            },
            update: {}
        });

        console.log('Gauntlet record initialized.');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
