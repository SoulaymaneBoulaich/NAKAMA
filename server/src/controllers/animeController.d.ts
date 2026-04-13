import type { Request, Response } from 'express';
export declare const searchAnime: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAnimeDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTopAnime: (req: Request, res: Response) => Promise<void>;
export declare const getSeasonalAnime: (req: Request, res: Response) => Promise<void>;
export declare const getGenres: (req: Request, res: Response) => Promise<void>;
export declare const discoverAnime: (req: Request, res: Response) => Promise<void>;
export declare const getRecommendations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=animeController.d.ts.map