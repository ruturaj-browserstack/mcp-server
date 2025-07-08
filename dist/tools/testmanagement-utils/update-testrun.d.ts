import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for updating a test run with partial fields.
 */
export declare const UpdateTestRunSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    test_run_id: z.ZodString;
    test_run: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        run_state: z.ZodOptional<z.ZodEnum<["new_run", "in_progress", "under_review", "rejected", "done", "closed"]>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
    }, {
        name?: string | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    test_run: {
        name?: string | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
    };
    test_run_id: string;
}, {
    project_identifier: string;
    test_run: {
        name?: string | undefined;
        run_state?: "new_run" | "in_progress" | "under_review" | "rejected" | "done" | "closed" | undefined;
    };
    test_run_id: string;
}>;
type UpdateTestRunArgs = z.infer<typeof UpdateTestRunSchema>;
/**
 * Partially updates an existing test run.
 */
export declare function updateTestRun(args: UpdateTestRunArgs, config: BrowserStackConfig): Promise<CallToolResult>;
export {};
