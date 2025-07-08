/**
 * If req === "latest" or "oldest", returns max/min numeric (or lex)
 * Else if exact match, returns that
 * Else picks the numerically closest (or first)
 */
export declare function resolveVersion(requested: string, available: string[]): string;
