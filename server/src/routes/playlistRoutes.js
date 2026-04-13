import { Router } from 'express';
import { getMyPlaylists, getPublicPlaylists, getFeaturedPlaylists, getPlaylistById, createPlaylist, updatePlaylist, deletePlaylist, addEntry, removeEntry, reorderEntries, addCollaborator, removeCollaborator, toggleFollow, getComments, addComment, deleteComment } from '../controllers/playlistController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Playlist CRUD
router.get('/', authenticateToken, getMyPlaylists);
router.get('/public', authenticateToken, getPublicPlaylists);
router.get('/featured', authenticateToken, getFeaturedPlaylists);
router.get('/:id', authenticateToken, getPlaylistById);
router.post('/', authenticateToken, createPlaylist);
router.put('/:id', authenticateToken, updatePlaylist);
router.delete('/:id', authenticateToken, deletePlaylist);
// Entries
router.post('/:id/entries', authenticateToken, addEntry);
router.delete('/:id/entries/:entryId', authenticateToken, removeEntry);
router.put('/:id/entries/reorder', authenticateToken, reorderEntries);
// Collaborators
router.post('/:id/collaborators', authenticateToken, addCollaborator);
router.delete('/:id/collaborators/:userId', authenticateToken, removeCollaborator);
// Interaction
router.post('/:id/follow', authenticateToken, toggleFollow);
// Comments
router.get('/:id/comments', authenticateToken, getComments);
router.post('/:id/comments', authenticateToken, addComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);
export default router;
//# sourceMappingURL=playlistRoutes.js.map