import { InteractionType } from '@prisma/client';
export declare const recordInteraction: (userId: string, animeId: string, type: InteractionType) => Promise<void>;
export declare const generateRecommendations: (userId: string) => Promise<{
    animeId: string;
    score: number;
    reason: string;
}[]>;
//# sourceMappingURL=recommendationService.d.ts.map