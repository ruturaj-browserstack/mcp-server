import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../lib/types.js";
export declare function fetchSelfHealSelectorTool(args: {
    sessionId: string;
}, config: BrowserStackConfig): Promise<CallToolResult>;
export default function addSelfHealTools(server: McpServer, config: BrowserStackConfig): void;
