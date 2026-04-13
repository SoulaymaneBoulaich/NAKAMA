import { InteractionType } from '@prisma/client';
/**
 * Record a user-anime interaction and update tag affinities
 */
export declare const recordInteraction: (userId: string, animeId: string, interactionType: InteractionType) => Promise<void>;
/**
 * Generate fresh recommendations for a user
 */
export declare const generateRecommendations: (userId: string) => Promise<any[]>;
/**
 * Get recommendations (with caching logic)
 */
export declare const getRecommendations: (userId: string) => Promise<string | number | boolean | any[] | import("@prisma/client/runtime/library").JsonObject | null>;
//# sourceMappingURL=recommendationEngine.d.ts.map