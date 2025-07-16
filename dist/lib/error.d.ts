import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Formats an AxiosError into a CallToolResult with an appropriate message.
 * @param err - The error object to format
 * @param defaultText - The fallback error message
 */
export declare function formatAxiosError(err: unknown, defaultText: string): CallToolResult;
