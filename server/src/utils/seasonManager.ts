import { prisma } from '../lib/prisma.js';
import { logger } from './logger.js';
import { addDays, isAfter } from 'date-fns';

export class SeasonManager {
    static async checkAndResetSeason() {
        try {
            const currentSeason = await prisma.debateSeason.findFirst({
                where: { isProcessed: false },
                orderBy: { endDate: 'desc' }
            });

            if (!currentSeason || isAfter(new Date(), currentSeason.endDate)) {
                logger.info('Starting season reset process...');
                await this.resetSeason(currentSeason?.id);
            }
        } catch (error) {
            logger.error('Error checking season reset:', error);
        }
    }

    static async resetSeason(seasonId?: string) {
        try {
            // 1. Mark season as processed
            if (seasonId) {
                await prisma.debateSeason.update({
                    where: { id: seasonId },
                    data: { isProcessed: true }
                });
            }

            // 2. Calculate Percentiles and Award Badges (Chapter 32.4)
            const allStats = await prisma.userDebateStats.findMany({
                where: { seasonPoints: { gt: 0 } },
                orderBy: { seasonPoints: 'desc' }
            });

            const totalUsers = allStats.length;
            if (totalUsers > 0) {
                for (let i = 0; i < totalUsers; i++) {
                    const stats = allStats[i];
                    const percentile = (i + 1) / totalUsers;
                    
                    let badge = '';
                    if (percentile <= 0.01) badge = 'Platinum Debater';
                    else if (percentile <= 0.05) badge = 'Gold Debater';
                    else if (percentile <= 0.10) badge = 'Silver Debater';

                    if (badge) {
                        const currentBadges = Array.isArray(stats.badges) ? stats.badges as string[] : [];
                        if (!currentBadges.includes(badge)) {
                            await prisma.userDebateStats.update({
                                where: { id: stats.id },
                                data: { badges: [...currentBadges, badge] }
                            });
                        }
                    }
                }
            }

            // 3. Reset Seasonal Stats (Chapter 32.2)
            // Note: Red signals carry over 1 season (Chapter 32.3)
            // We need to check redSignalsHistory and remove those that have completed carryover
            const statsWithReds = await prisma.userDebateStats.findMany({
                where: { OR: [ { redSignals: { gt: 0 } }, { seasonPoints: { gt: 0 } } ] }
            });

            for (const stats of statsWithReds) {
                let history = Array.isArray(stats.redSignalsHistory) ? stats.redSignalsHistory as any[] : [];
                const now = new Date();
                
                // Red signals expire individually after 2 seasons (current + 1 carryover)
                // For simplicity, we filter out those whose expiresAt < now
                const activeReds = history.filter(r => isAfter(new Date(r.expiresAt), now));
                
                await prisma.userDebateStats.update({
                    where: { id: stats.id },
                    data: {
                        seasonPoints: 0,
                        judgePoints: 0,
                        yellowSignals: 0,
                        greenSignals: 0,
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        redSignals: activeReds.length,
                        redSignalsHistory: activeReds
                    }
                });
            }

            // 4. Create New Season Record
            const nextSeasonStart = new Date();
            const nextSeasonEnd = addDays(nextSeasonStart, 90);
            await prisma.debateSeason.create({
                data: {
                    name: `Season ${new Date().getFullYear()}.${Math.floor(new Date().getMonth() / 3) + 1}`,
                    startDate: nextSeasonStart,
                    endDate: nextSeasonEnd
                }
            });

            logger.info('Season reset complete.');
        } catch (error) {
            logger.error('Error during season reset:', error);
        }
    }
}
