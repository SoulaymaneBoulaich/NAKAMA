/**
 * Safely extracts a string from Express req.params or req.query.
 * Handles string | string[] | undefined ambiguity for strict TypeScript build.
 */
export const getStringParam = (param, defaultValue = '') => {
    if (Array.isArray(param))
        return param[0] || defaultValue;
    return param || defaultValue;
};
export const getStringQuery = (query, defaultValue = '') => {
    if (Array.isArray(query))
        return String(query[0]) || defaultValue;
    if (typeof query === 'string')
        return query;
    if (query)
        return String(query);
    return defaultValue;
};
//# sourceMappingURL=params.js.map