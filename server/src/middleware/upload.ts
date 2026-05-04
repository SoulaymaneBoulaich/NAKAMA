import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js';

// Configuration for AniShots
const anishotStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith('video/');
    return {
      folder: 'nakama/anishots',
      resource_type: 'auto',
      transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
    };
  },
});

// Configuration for Posts (Image + Video)
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith('video/');
    return {
      folder: 'nakama/posts',
      resource_type: 'auto',
      transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
    };
  },
});

// Configuration for Avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nakama/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      ],
    };
  },
});

// Common file filter
const imageFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP and GIF are allowed.'), false);
  }
};

const mediaFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and MP4/MOV/WEBM videos are allowed.'), false);
  }
};

export const uploadAnishot = multer({ 
  storage: anishotStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: mediaFilter
});

export const uploadPost = multer({ 
  storage: postStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for posts
  fileFilter: mediaFilter
});

export const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: imageFilter
});

// Legacy compatibility (re-routing existing 'upload' to 'uploadPost')
export const upload = uploadPost;
