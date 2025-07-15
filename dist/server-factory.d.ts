import { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrowserStackConfig } from "./lib/types.js";
/**
 * Wrapper class for BrowserStack MCP Server
 * Stores a map of registered tools by name
 */
export declare class BrowserStackMcpServer {
    private config;
    server: McpServer;
    tools: Record<string, RegisteredTool>;
    constructor(config: BrowserStackConfig);
    /**
     * Calls each tool-adder function and collects their returned tools
     */
    private registerTools;
    /**
     * Expose the underlying MCP server instance
     */
    getInstance(): McpServer;
    /**
     * Get all registered tools
     */
    getTools(): Record<string, RegisteredTool>;
}
