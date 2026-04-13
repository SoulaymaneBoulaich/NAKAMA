import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const browseCommunities: (req: Request, res: Response) => Promise<void>;
export declare const getCommunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCommunity: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCommunityPosts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const joinCommunity: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const leaveCommunity: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCommunity: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeMember: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMembers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserCommunities: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=communityController.d.ts.map