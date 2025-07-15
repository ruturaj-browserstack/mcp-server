import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../lib/types.js";
/**
 * Launches an App Live Session on BrowserStack.
 */
export declare function startAppLiveSession(args: {
    desiredPlatform: string;
    desiredPlatformVersion: string;
    appPath: string;
    desiredPhone: string;
}, config: BrowserStackConfig): Promise<CallToolResult>;
export default function addAppLiveTools(server: McpServer, config: BrowserStackConfig): Record<string, any>;
