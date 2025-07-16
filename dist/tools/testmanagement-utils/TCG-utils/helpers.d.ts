import { DefaultFieldMaps } from "./types.js";
/**
 * Build mappings for default fields for priority, status, and case type.
 */
export declare function buildDefaultFieldMaps(defaultFields: any): DefaultFieldMaps;
/**
 * Find a boolean custom field ID if present.
 */
export declare function findBooleanFieldId(customFields: any[]): number | undefined;
/**
 * Construct payload for creating a single test case in bulk.
 */
export declare function createTestCasePayload(tc: any, scenarioId: string, folderId: string, fieldMaps: DefaultFieldMaps, documentId: number, booleanFieldId?: number, traceId?: string): Record<string, any>;
