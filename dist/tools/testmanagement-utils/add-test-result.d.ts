import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for adding a test result to a test run.
 */
export declare const AddTestResultSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    test_run_id: z.ZodString;
    test_result: z.ZodObject<{
        status: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        description?: string | undefined;
    }, {
        status: string;
        description?: string | undefined;
    }>;
    test_case_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    test_run_id: string;
    test_result: {
        status: string;
        description?: string | undefined;
    };
    test_case_id: string;
}, {
    project_identifier: string;
    test_run_id: string;
    test_result: {
        status: string;
        description?: string | undefined;
    };
    test_case_id: string;
}>;
export type AddTestResultArgs = z.infer<typeof AddTestResultSchema>;
/**
 * Adds a test result to a specific test run via BrowserStack Test Management API.
 */
export declare function addTestResult(rawArgs: AddTestResultArgs, config: BrowserStackConfig): Promise<CallToolResult>;
