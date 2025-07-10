import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for the upload file tool
 */
export declare const UploadFileSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    file_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    file_path: string;
}, {
    project_identifier: string;
    file_path: string;
}>;
/**
 * Uploads a file to BrowserStack Test Management and returns the signed URL.
 */
export declare function uploadFile(args: z.infer<typeof UploadFileSchema>, config: BrowserStackConfig): Promise<CallToolResult>;
