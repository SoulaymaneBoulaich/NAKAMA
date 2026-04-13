import type { Request, Response } from 'express';
export declare const getNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getHero: (req: Request, res: Response) => Promise<void>;
export declare const getPopular: (req: Request, res: Response) => Promise<void>;
export declare const getTrending: (req: Request, res: Response) => Promise<void>;
export declare const getCharacter: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=publicController.d.ts.map