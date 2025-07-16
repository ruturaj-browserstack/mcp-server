import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for listing test cases with optional filters.
 */
export declare const ListTestCasesSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    folder_id: z.ZodOptional<z.ZodString>;
    case_type: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    p: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    priority?: string | undefined;
    case_type?: string | undefined;
    folder_id?: string | undefined;
    p?: number | undefined;
}, {
    project_identifier: string;
    priority?: string | undefined;
    case_type?: string | undefined;
    folder_id?: string | undefined;
    p?: number | undefined;
}>;
export type ListTestCasesArgs = z.infer<typeof ListTestCasesSchema>;
/**
 * Calls BrowserStack Test Management to list test cases with filters.
 */
export declare function listTestCases(args: ListTestCasesArgs, config: BrowserStackConfig): Promise<CallToolResult>;
