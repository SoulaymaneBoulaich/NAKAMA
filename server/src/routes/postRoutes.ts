import express from 'express';
import { 
  createPost, 
  deletePost, 
  toggleLike, 
  getComments, 
  createComment, 
  deleteComment 
} from '../controllers/postController.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, createCommentSchema } from '../schemas/postSchema.js';

const router = express.Router();

router.post('/', authenticateToken, upload.single('image'), validate(createPostSchema), createPost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:postId/like', authenticateToken, toggleLike);
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', authenticateToken, validate(createCommentSchema), createComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

export default router;
