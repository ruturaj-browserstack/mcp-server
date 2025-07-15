import { DefaultFieldMaps, Scenario, CreateTestCasesFromFileArgs } from "./types.js";
import { BrowserStackConfig } from "../../../lib/types.js";
/**
 * Fetch default and custom form fields for a project.
 */
export declare function fetchFormFields(projectId: string, config: BrowserStackConfig): Promise<{
    default_fields: any;
    custom_fields: any;
}>;
/**
 * Trigger AI-based test case generation for a document.
 */
export declare function triggerTestCaseGeneration(document: string, documentId: number, folderId: string, projectId: string, source: string, config: BrowserStackConfig): Promise<string>;
/**
 * Initiate a fetch for test-case details; returns the traceRequestId for polling.
 */
export declare function fetchTestCaseDetails(documentId: number, folderId: string, projectId: string, testCaseIds: string[], source: string, config: BrowserStackConfig): Promise<string>;
/**
 * Poll for a given traceRequestId until all test-case details are returned.
 */
export declare function pollTestCaseDetails(traceRequestId: string, config: BrowserStackConfig): Promise<Record<string, any>>;
/**
 * Poll for scenarios & testcases, trigger detail fetches, then poll all details in parallel.
 */
export declare function pollScenariosTestDetails(args: CreateTestCasesFromFileArgs, traceId: string, context: any, documentId: number, source: string, config: BrowserStackConfig): Promise<Record<string, Scenario>>;
/**
 * Bulk-create generated test cases in BrowserStack.
 */
export declare function bulkCreateTestCases(scenariosMap: Record<string, Scenario>, projectId: string, folderId: string, fieldMaps: DefaultFieldMaps, booleanFieldId: number | undefined, traceId: string, context: any, documentId: number, config: BrowserStackConfig): Promise<string>;
export declare function projectIdentifierToId(projectId: string, config: BrowserStackConfig): Promise<string>;
export declare function testCaseIdentifierToDetails(projectId: string, testCaseIdentifier: string, config: BrowserStackConfig): Promise<{
    testCaseId: string;
    folderId: string;
}>;
