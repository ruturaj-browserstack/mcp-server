import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for creating a test run.
 */
export declare const CreateTestRunSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    test_run: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        run_state: z.ZodOptional<z.ZodEnum<["new_run", "in_progress", "under_review", "rejected", "done", "closed"]>>;
        issues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        issue_tracker: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            host: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            host: string;
        }, {
            name: string;
            host: string;
        }>>;
        test_cases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        folder_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        issues?: string[] | undefined;
        description?: string | undefined;
        issue_tracker?: {
            name: string;
            host: string;
        } | undefined;
        test_cases?: string[] | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
        folder_ids?: number[] | undefined;
    }, {
        name: string;
        issues?: string[] | undefined;
        description?: string | undefined;
        issue_tracker?: {
            name: string;
            host: string;
        } | undefined;
        test_cases?: string[] | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
        folder_ids?: number[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    test_run: {
        name: string;
        issues?: string[] | undefined;
        description?: string | undefined;
        issue_tracker?: {
            name: string;
            host: string;
        } | undefined;
        test_cases?: string[] | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
        folder_ids?: number[] | undefined;
    };
}, {
    project_identifier: string;
    test_run: {
        name: string;
        issues?: string[] | undefined;
        description?: string | undefined;
        issue_tracker?: {
            name: string;
            host: string;
        } | undefined;
        test_cases?: string[] | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
        folder_ids?: number[] | undefined;
    };
}>;
export type CreateTestRunArgs = z.infer<typeof CreateTestRunSchema>;
/**
 * Creates a test run via BrowserStack Test Management API.
 */
export declare function createTestRun(rawArgs: CreateTestRunArgs, config: BrowserStackConfig): Promise<CallToolResult>;
