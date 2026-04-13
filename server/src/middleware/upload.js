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
export const uploadAnishot = multer({ storage: anishotStorage });
export const uploadPost = multer({ storage: postStorage });
export const uploadAvatar = multer({ storage: avatarStorage });
// Legacy compatibility (re-routing existing 'upload' to 'uploadPost')
export const upload = uploadPost;
//# sourceMappingURL=upload.js.map