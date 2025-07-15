import { BrowserStackConfig } from "../../../lib/types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Handler for the runTestsOnBrowserStack tool.
 * Validates input, builds instructions, and returns structured output.
 */
export declare function runTestsOnBrowserStackHandler(rawInput: unknown, config: BrowserStackConfig): Promise<CallToolResult>;
