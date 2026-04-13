import { Router } from 'express';
import * as storyController from '../controllers/storyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public browse
router.get('/', storyController.browseStories);
router.get('/:id', storyController.getStoryById);
router.get('/:id/chapters', storyController.getChapters);
router.get('/:id/chapters/:chapterId', storyController.getChapterById);
router.get('/:id/ratings', storyController.getRatings);

// Authenticated routes
router.use(authenticateToken);

router.get('/mine', storyController.getMyStories);
router.post('/', upload.single('cover'), storyController.createStory);
router.put('/:id', upload.single('cover'), storyController.updateStory);
router.delete('/:id', storyController.deleteStory);

// Collaborators
router.post('/:id/collaborators', storyController.addCollaborator);
router.delete('/:id/collaborators/:userId', storyController.removeCollaborator);

// Chapters
router.post('/:id/chapters', storyController.createChapter);
router.put('/:id/chapters/:chapterId', storyController.updateChapter);
router.delete('/:id/chapters/:chapterId', storyController.deleteChapter);

// Ratings, Comments, Follows
router.post('/:id/rate', storyController.rateStory);
router.post('/:id/chapters/:chapterId/comments', storyController.addChapterComment);
router.delete('/chapters/comments/:commentId', storyController.deleteChapterComment);
router.post('/:id/follow', storyController.toggleFollow);

export default router;
