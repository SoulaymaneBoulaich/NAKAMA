import type { JikanAnime } from '../../../shared/types/index.js';
export declare const searchAnime: (query: string) => Promise<JikanAnime[]>;
export declare const getAnimeById: (id: string) => Promise<JikanAnime>;
export declare const getTopAnime: (filter?: string, limit?: number) => Promise<JikanAnime[]>;
export declare const getSeasonalAnime: (limit?: number) => Promise<JikanAnime[]>;
export declare const getGenres: () => Promise<any[]>;
export declare const discoverAnime: (params: {
    producers?: string;
    genres?: string;
    order_by?: string;
    sort?: string;
    limit?: number;
}) => Promise<JikanAnime[]>;
//# sourceMappingURL=jikanService.d.ts.map