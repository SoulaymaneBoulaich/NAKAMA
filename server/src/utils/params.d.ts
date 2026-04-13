/**
 * Safely extracts a string from Express req.params or req.query.
 * Handles string | string[] | undefined ambiguity for strict TypeScript build.
 */
export declare const getStringParam: (param: string | string[] | undefined, defaultValue?: string) => string;
export declare const getStringQuery: (query: string | any | undefined, defaultValue?: string) => string;
//# sourceMappingURL=params.d.ts.map