import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../lib/types.js";
import { AppAutomateLogType, AutomateLogType, SessionType } from "../lib/constants.js";
type LogType = AutomateLogType | AppAutomateLogType;
type SessionTypeValues = SessionType;
export declare function getFailureLogs(args: {
    sessionId: string;
    buildId?: string;
    logTypes: LogType[];
    sessionType: SessionTypeValues;
}, config: BrowserStackConfig): Promise<CallToolResult>;
export default function registerGetFailureLogs(server: McpServer, config: BrowserStackConfig): void;
export {};
