import type { Response } from 'express';
export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const setRefreshTokenCookie: (res: Response, token: string) => void;
export declare const clearRefreshTokenCookie: (res: Response) => void;
export declare const verifyAccessToken: (token: string) => {
    userId: string;
} | null;
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
} | null;
//# sourceMappingURL=tokens.d.ts.map