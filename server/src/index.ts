import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
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
import watchPartyRoutes from './routes/watchPartyRoutes.js';
import * as recs from './services/recommendationService.js';
import { prisma } from './lib/prisma.js';
import { authenticateToken } from './middleware/auth.js';
import cron from 'node-cron';
import { createServer } from 'http';
import { initSocket } from './socket/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Sockets
initSocket(server);

// Community Validation Job (runs every 24 hours)
const cleanupUnvalidatedCommunities = async () => {
  try {
    console.log('[Job] Running community validation cleanup...');
    const now = new Date();
    await prisma.community.deleteMany({
      where: {
        isValidated: false,
        validationDeadline: { lt: now }
      }
    });
  } catch (error) {
    console.error('[Job] Error in community cleanup:', error);
  }
};

setInterval(cleanupUnvalidatedCommunities, 24 * 60 * 60 * 1000);
// Run once on startup after 1 minute
setTimeout(cleanupUnvalidatedCommunities, 60 * 1000);

// AniShot Expiry Cleanup (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[Job] Cleaning up expired AniShots...');
    const now = new Date();
    const result = await prisma.aniShot.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    if (result.count > 0) {
      console.log(`[Job] Deleted ${result.count} expired AniShots.`);
    }
  } catch (error) {
    console.error('[Job] Error in AniShot cleanup:', error);
  }
});

// Recommendation Refresh Job (runs at 3 AM daily)
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('[Job] Refreshing all user recommendations...');
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await recs.generateRecommendations(user.id).catch(err => 
        console.error(`Error generating recs for ${user.id}:`, err)
      );
    }
    console.log('[Job] Recommendation refresh complete.');
  } catch (error) {
    console.error('[Job] Error in recommendation job:', error);
  }
});


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
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
app.use('/api/watchparty', authenticateToken, watchPartyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (with Sockets)`);
});
