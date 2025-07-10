import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Poll test case details to check LCA build status
 */
export declare function pollLCAStatus(projectId: string, folderId: string, testCaseId: string, context: any, maxWaitTimeMs: number | undefined, // 10 minutes default
initialWaitMs: number | undefined, // 2 minutes initial wait
pollIntervalMs: number | undefined, // 10 seconds interval
config: BrowserStackConfig): Promise<{
    resource_path: string;
    status: string;
} | null>;
