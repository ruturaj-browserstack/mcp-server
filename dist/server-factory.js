import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
function registerTools(server, config) {
    addAccessibilityTools(server, config);
    addSDKTools(server, config);
    addAppLiveTools(server, config);
    addBrowserLiveTools(server, config);
    addTestManagementTools(server, config);
    addAppAutomationTools(server, config);
    addFailureLogsTools(server, config);
    addAutomateTools(server, config);
    addSelfHealTools(server, config);
}
export function createMcpServer(config) {
    logger.info("Creating BrowserStack MCP Server, version %s", packageJson.version);
    // Create an MCP server
    const server = new McpServer({
        name: "BrowserStack MCP Server",
        version: packageJson.version,
    });
    setupOnInitialized(server, config);
    registerTools(server, config);
    return server;
}
