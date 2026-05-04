import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import animeRoutes from './routes/animeRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import followRoutes from './routes/followRoutes.js';
import postRoutes from './routes/postRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import anishotsRoutes from './routes/anishots.js';
import uploadRoutes from './routes/upload.js';
import anijudgeRoutes from './routes/anijudge.js';
import messageRoutes from './routes/messages.js';
import recommendationsRoutes from './routes/recommendations.js';
import watchPartyRoutes from './routes/watchPartyRoutes.js';
import quizRoutes from './routes/quiz.js';
import voteRoutes from './routes/voteRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import * as recs from './services/recommendationEngine.js';
import { prisma } from './lib/prisma.js';
import { authenticateToken } from './middleware/auth.js';
import cron from 'node-cron';
import { createServer } from 'http';
import { initSocket } from './socket/index.js';
import { startDailyQuizCron } from './utils/dailyQuizCron.js';

dotenv.config();

const app = express();
export { app }; 
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Sockets
initSocket(server);

// Start Daily Quiz Rotation System
startDailyQuizCron();

// Community Validation Job (runs every 24 hours)
const cleanupUnvalidatedCommunities = async () => {
  try {
    logger.info('[Job] Running community validation cleanup...');
    const now = new Date();
    await prisma.community.deleteMany({
      where: {
        isValidated: false,
        validationDeadline: { lt: now }
      }
    });
  } catch (error) {
    logger.error('[Job] Error in community cleanup:', error);
  }
};

setInterval(cleanupUnvalidatedCommunities, 24 * 60 * 60 * 1000);
// Run once on startup after 1 minute
setTimeout(cleanupUnvalidatedCommunities, 60 * 1000);

// AniShot Expiry Cleanup (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('[Job] Cleaning up expired AniShots...');
    const now = new Date();
    const result = await prisma.aniShot.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    if (result.count > 0) {
      logger.info(`[Job] Deleted ${result.count} expired AniShots.`);
    }
  } catch (error) {
    logger.error('[Job] Error in AniShot cleanup:', error);
  }
});

// Recommendation Refresh Job (runs at 3 AM daily)
// Batch process up to 50 users to stay within Jikan limits
cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('[Job] Starting batch recommendation refresh...');
    // Only refresh users who haven't had a refresh in 24h, max 50
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const usersToRefresh = await prisma.user.findMany({
      where: {
        OR: [
          { recommendationCache: { is: null } },
          { recommendationCache: { generatedAt: { lt: yesterday } } }
        ]
      },
      take: 50,
      select: { id: true }
    });

    for (const user of usersToRefresh) {
      logger.info(`[Job] Refreshing recs for user ${user.id}...`);
      await recs.generateRecommendations(user.id).catch(err => 
        logger.error(`Error generating recs for ${user.id}:`, err)
      );
      // Wait between users to avoid API pressure
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    logger.info(`[Job] Batch recommendation refresh complete (${usersToRefresh.length} users).`);
  } catch (error) {
    logger.error('[Job] Error in recommendation job:', error);
  }
});


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Security Middleware
app.use(helmet()); // Set security headers
app.use(hpp()); // Prevent HTTP parameter pollution

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased for development to prevent loops blocking UI
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // Body limit to prevent large payload attacks
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', authenticateToken, animeRoutes);
app.use('/api/entries', authenticateToken, entryRoutes);
app.use('/api/ratings', authenticateToken, ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', authenticateToken, followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/anishots', anishotsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/anijudge', authenticateToken, anijudgeRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/watchparty', watchPartyRoutes); // Removed forced auth middleware here as handled inside for public/private
app.use('/api/quiz', quizRoutes);
app.use('/api/recommendations', authenticateToken, recommendationsRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} (with Sockets)`);
  });
}
