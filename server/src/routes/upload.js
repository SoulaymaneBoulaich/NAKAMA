import express, {} from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadPost, uploadAvatar, uploadAnishot } from '../middleware/upload.js';
import { prisma } from '../lib/prisma.js';
const router = express.Router();
// General Image/Post Upload
router.post('/image', authenticateToken, (req, res, next) => {
    uploadPost.single('file')(req, res, (err) => {
        if (err) {
            console.error('[Upload] Multer error (image):', err);
            return res.status(400).json({ error: err.message || 'Multer upload error' });
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        // Cloudinary adds details to req.file.path/filename
        const file = req.file;
        res.status(200).json({
            url: file.path,
            publicId: file.filename,
            width: file.width,
            height: file.height
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});
// Video Upload
router.post('/video', authenticateToken, (req, res, next) => {
    uploadPost.single('file')(req, res, (err) => {
        if (err) {
            console.error('[Upload] Multer error (video):', err);
            return res.status(400).json({ error: err.message || 'Multer upload error' });
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file;
        res.status(200).json({
            url: file.path,
            publicId: file.filename,
            format: file.format,
            duration: file.duration
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});
// Avatar Upload with Auto-Update
router.post('/avatar', authenticateToken, uploadAvatar.single('file'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file;
        const userId = req.userId;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar: file.path },
            select: { avatar: true }
        });
        res.status(200).json({ url: updatedUser.avatar });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Avatar upload failed' });
    }
});
// AniShot Media Upload
router.post('/anishot', authenticateToken, (req, res, next) => {
    uploadAnishot.single('file')(req, res, (err) => {
        if (err) {
            console.error('[Upload] Multer error (anishot):', err);
            return res.status(400).json({ error: err.message || 'Multer upload error' });
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const file = req.file;
        res.status(200).json({ url: file.path });
    }
    catch (error) {
        console.error('[Upload] AniShot upload error:', error);
        res.status(500).json({ error: error.message || 'AniShot upload failed' });
    }
});
export default router;
//# sourceMappingURL=upload.js.map