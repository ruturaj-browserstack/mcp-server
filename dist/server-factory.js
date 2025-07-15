import { McpServer, } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
import logger from "./logger.js";
import addSDKTools from "./tools/bstack-sdk.js";
import addBrowserLiveTools from "./tools/live.js";
import addAccessibilityTools from "./tools/accessibility.js";
import addTestManagementTools from "./tools/testmanagement.js";
import addAppAutomationTools from "./tools/appautomate.js";
import addFailureLogsTools from "./tools/getFailureLogs.js";
import addAutomateTools from "./tools/automate.js";
import addSelfHealTools from "./tools/selfheal.js";
import addAppLiveTools from "./tools/applive.js";
import { setupOnInitialized } from "./oninitialized.js";
/**
 * Wrapper class for BrowserStack MCP Server
 * Stores a map of registered tools by name
 */
export class BrowserStackMcpServer {
    config;
    server;
    tools = {};
    constructor(config) {
        this.config = config;
        logger.info("Creating BrowserStack MCP Server, version %s", packageJson.version);
        this.server = new McpServer({
            name: "BrowserStack MCP Server",
            version: packageJson.version,
        });
        setupOnInitialized(this.server, this.config);
        this.registerTools();
    }
    /**
     * Calls each tool-adder function and collects their returned tools
     */
    registerTools() {
        const toolAdders = [
            addAccessibilityTools,
            addSDKTools,
            addAppLiveTools,
            addBrowserLiveTools,
            addTestManagementTools,
            addAppAutomationTools,
            addFailureLogsTools,
            addAutomateTools,
            addSelfHealTools,
        ];
        toolAdders.forEach((adder) => {
            // Each adder now returns a Record<string, Tool>
            const added = adder(this.server, this.config);
            Object.assign(this.tools, added);
        });
    }
    /**
     * Expose the underlying MCP server instance
     */
    getInstance() {
        return this.server;
    }
    /**
     * Get all registered tools
     */
    getTools() {
        return this.tools;
    }
}
