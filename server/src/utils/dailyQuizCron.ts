import cron from 'node-cron';
import { rotateDailyQuestion } from '../controllers/dailyQuizController.js';

export const startDailyQuizCron = () => {
    // Run every day at 00:00 UTC
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Rotating Daily Question...');
        try {
            await rotateDailyQuestion();
            console.log('[CRON] Daily Question rotated successfully.');
        } catch (error) {
            console.error('[CRON] Failed to rotate daily question:', error);
        }
    });

    // Check if daily question exists for today on startup
    rotateDailyQuestion().catch(err => {
        console.error('[STARTUP] Initial daily question rotation failed:', err);
    });
};
