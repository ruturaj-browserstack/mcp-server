import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for listing test runs with optional filters.
 */
export declare const ListTestRunsSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    run_state: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    run_state?: string | undefined;
}, {
    project_identifier: string;
    run_state?: string | undefined;
}>;
type ListTestRunsArgs = z.infer<typeof ListTestRunsSchema>;
/**
 * Fetches and formats the list of test runs for a project.
 */
export declare function listTestRuns(args: ListTestRunsArgs, config: BrowserStackConfig): Promise<CallToolResult>;
export {};
