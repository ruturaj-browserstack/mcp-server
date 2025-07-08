import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { SessionType } from "../lib/constants.js";
import { BrowserStackConfig } from "../lib/types.js";
export declare function fetchAutomationScreenshotsTool(args: {
    sessionId: string;
    sessionType: SessionType;
}, config: BrowserStackConfig): Promise<CallToolResult>;
export default function addAutomationTools(server: McpServer, config: BrowserStackConfig): void;
