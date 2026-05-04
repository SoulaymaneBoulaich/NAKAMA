import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateMeSchema, searchUsersSchema, changePasswordSchema } from '../schemas/userSchema.js';

const router = Router();

router.get('/search', authenticateToken, validate(searchUsersSchema), userController.searchUsers);

// Protected routes (self) — must be before /:username to avoid matching "me" as a username
router.put('/me', authenticateToken, validate(updateMeSchema), userController.updateMe);
router.get('/me/full-settings', authenticateToken, userController.getFullSettings);
router.put('/me/privacy', authenticateToken, userController.updatePrivacy);
router.put('/me/personalization', authenticateToken, userController.updatePersonalization);
router.put('/me/notifications', authenticateToken, userController.updateNotificationSettings);
router.post('/me/change-password', authenticateToken, validate(changePasswordSchema), userController.changePassword);
router.delete('/me/deactivate', authenticateToken, userController.deactivateAccount);
router.get('/me/export', authenticateToken, userController.exportUserData);

router.post('/me/topten', authenticateToken, userController.addTopTenEntry);
router.delete('/me/topten/rank/:rank', authenticateToken, userController.removeTopTenEntryByRank);
router.delete('/me/topten/:entryId', authenticateToken, userController.removeTopTenEntry);

// Publicly accessible but aware of requester identity for privacy checks
router.get('/:username', optionalAuthenticateToken, userController.getUserProfile);
router.get('/:username/stats', optionalAuthenticateToken, userController.getUserStats);
router.get('/:username/fingerprint', optionalAuthenticateToken, userController.getUserFingerprint);
router.get('/:username/topten', optionalAuthenticateToken, userController.getUserTopTen);
router.get('/:username/activity', optionalAuthenticateToken, userController.getUserActivity);
router.get('/:username/playlists', optionalAuthenticateToken, userController.getUserPlaylists);
router.get('/:username/posts', optionalAuthenticateToken, userController.getUserPosts);
router.get('/:username/debates', optionalAuthenticateToken, userController.getUserDebates);

export default router;
