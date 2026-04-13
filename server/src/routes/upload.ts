import express, { type Request, type Response, type NextFunction } from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { uploadPost, uploadAvatar, uploadAnishot } from '../middleware/upload.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// General Image/Post Upload
router.post('/image', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  uploadPost.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error (image):', err);
      return res.status(400).json({ error: err.message || 'Multer upload error' });
    }
    next();
  });
}, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Cloudinary adds details to req.file.path/filename
    const file = req.file as any;
    res.status(200).json({
      url: file.path,
      publicId: file.filename,
      width: file.width,
      height: file.height
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Video Upload
router.post('/video', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  uploadPost.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error (video):', err);
      return res.status(400).json({ error: err.message || 'Multer upload error' });
    }
    next();
  });
}, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const file = req.file as any;
    res.status(200).json({
      url: file.path,
      publicId: file.filename,
      format: file.format,
      duration: file.duration
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Avatar Upload with Auto-Update
router.post('/avatar', authenticateToken, uploadAvatar.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const file = req.file as any;
    const userId = req.userId!;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: file.path },
      select: { avatar: true }
    });

    res.status(200).json({ url: updatedUser.avatar });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Avatar upload failed' });
  }
});

// AniShot Media Upload
router.post('/anishot', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  uploadAnishot.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error (anishot):', err);
      return res.status(400).json({ error: err.message || 'Multer upload error' });
    }
    next();
  });
}, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const file = req.file as any;
    res.status(200).json({ url: file.path });
  } catch (error: any) {
    console.error('[Upload] AniShot upload error:', error);
    res.status(500).json({ error: error.message || 'AniShot upload failed' });
  }
});

export default router;
