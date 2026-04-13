import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getMyPlaylists: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPublicPlaylists: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedPlaylists: (req: Request, res: Response) => Promise<void>;
export declare const getPlaylistById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPlaylist: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePlaylist: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePlaylist: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reorderEntries: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addCollaborator: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeCollaborator: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleFollow: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getComments: (req: Request, res: Response) => Promise<void>;
export declare const addComment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteComment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=playlistController.d.ts.map