import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
export declare const CreateProjFoldSchema: z.ZodObject<{
    project_name: z.ZodOptional<z.ZodString>;
    project_description: z.ZodOptional<z.ZodString>;
    project_identifier: z.ZodOptional<z.ZodString>;
    folder_name: z.ZodOptional<z.ZodString>;
    folder_description: z.ZodOptional<z.ZodString>;
    parent_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    project_name?: string | undefined;
    project_description?: string | undefined;
    project_identifier?: string | undefined;
    folder_name?: string | undefined;
    folder_description?: string | undefined;
    parent_id?: number | undefined;
}, {
    project_name?: string | undefined;
    project_description?: string | undefined;
    project_identifier?: string | undefined;
    folder_name?: string | undefined;
    folder_description?: string | undefined;
    parent_id?: number | undefined;
}>;
type CreateProjFoldArgs = z.infer<typeof CreateProjFoldSchema>;
/**
 * Creates a project and/or folder in BrowserStack Test Management.
 */
export declare function createProjectOrFolder(args: CreateProjFoldArgs, config: BrowserStackConfig): Promise<CallToolResult>;
export {};
