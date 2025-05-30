#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
import "dotenv/config";
import logger from "./logger.js";
import addSDKTools from "./tools/bstack-sdk.js";
import addAppLiveTools from "./tools/applive.js";
import addBrowserLiveTools from "./tools/live.js";
import addAccessibilityTools from "./tools/accessibility.js";
import addTestManagementTools from "./tools/testmanagement.js";
import addAppAutomationTools from "./tools/appautomate.js";
import addFailureLogsTools from "./tools/getFailureLogs.js";
import addAutomateTools from "./tools/automate.js";
import addSelfHealTools from "./tools/selfheal.js";
import { setupOnInitialized } from "./oninitialized.js";
import { ProductManager, BrowserStackProduct } from "./lib/product-manager.js";
import { addDynamicTools } from "./tools/dynamic.js";

function setupDynamicProductManager(server: McpServer): ProductManager {
  const productManager = new ProductManager(server);

  // Register all product tool registration functions
  productManager.registerProduct(BrowserStackProduct.SDK, addSDKTools);
  productManager.registerProduct(BrowserStackProduct.APP_LIVE, addAppLiveTools);
  productManager.registerProduct(
    BrowserStackProduct.BROWSER_LIVE,
    addBrowserLiveTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.ACCESSIBILITY,
    addAccessibilityTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.TEST_MANAGEMENT,
    addTestManagementTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.APP_AUTOMATION,
    addAppAutomationTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.FAILURE_LOGS,
    addFailureLogsTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.AUTOMATE,
    addAutomateTools,
  );
  productManager.registerProduct(
    BrowserStackProduct.SELF_HEAL,
    addSelfHealTools,
  );

  return productManager;
}

function registerDynamicTools(server: McpServer) {
  // Set up the product manager
  const productManager = setupDynamicProductManager(server);

  // Add the dynamic tools (enable_products and get_product_status)
  addDynamicTools(server, productManager);

  logger.info(
    "Dynamic product management initialized. Use 'enable_products' tool to activate specific BrowserStack capabilities.",
  );
}

// Create an MCP server
const server: McpServer = new McpServer({
  name: "BrowserStack MCP Server",
  version: packageJson.version,
});

setupOnInitialized(server);

registerDynamicTools(server);

async function main() {
  logger.info(
    "Launching BrowserStack MCP server, version %s",
    packageJson.version,
  );

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

// Ensure logs are flushed before exit
process.on("exit", () => {
  logger.flush();
});
