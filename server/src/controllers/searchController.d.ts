import type { Request, Response } from 'express';
/**
 * GET /api/search
 * Query params: q (search term), type (all, anime, users, communities)
 */
export declare const unifiedSearch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=searchController.d.ts.map