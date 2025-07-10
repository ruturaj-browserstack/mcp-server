import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../lib/types.js";
export declare function getFailuresInLastRun(buildName: string, projectName: string, config: BrowserStackConfig): Promise<CallToolResult>;
export default function addObservabilityTools(server: McpServer, config: BrowserStackConfig): void;
