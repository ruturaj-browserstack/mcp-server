import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrowserStackConfig } from "../lib/types.js";
import { RunTestsOnBrowserStackParamsShape } from "./sdk-utils/runTestsOnBrowserStack/schema.js";
import { runTestsOnBrowserStackHandler } from "./sdk-utils/runTestsOnBrowserStack/handler.js";

/**
 * Tool description for runTestsOnBrowserStack
 */
const TOOL_DESCRIPTION = `Use this tool to get instructions for running tests on BrowserStack and BrowserStack Percy. It sets up the BrowserStack SDK and runs your test cases on BrowserStack.

Three User Execution Modes:

1. **'percy-disabled'** (default) - BrowserStack SDK only
   • Sets up BrowserStack SDK for cross-browser testing
   • No visual testing included

2. **'percy-with-sdk'** - BrowserStack SDK with Percy integration  
   • Sets up BrowserStack SDK + Percy for visual testing
   • Automatically falls back to Percy Automate if Percy SDK is unsupported
   • This is what users choose when they want "tests with Percy"

3. **'percy-web'** - Percy Web only 
   • Uses Percy Web for visual testing without BrowserStack SDK
   • Currently not implemented

Set 'percyMode' to control the execution path:
• 'percy-disabled': BrowserStack SDK only (default)
• 'percy-with-sdk': BrowserStack SDK + Percy (with automatic fallback)
• 'percy-web': Percy Web only

Note: percy-web mode is not yet implemented. Percy Automate is only used as an internal fallback when Percy SDK is not supported - users never directly choose it.`;

/**
 * Registers the runTestsOnBrowserStack tool with the MCP server.
 * All logic, schema, and error messages are modularized for testability and maintainability.
 */
export function registerRunTestsOnBrowserStackTool(
  server: McpServer,
  config: BrowserStackConfig,
) {
  server.tool(
    "runTestsOnBrowserStack",
    TOOL_DESCRIPTION,
    RunTestsOnBrowserStackParamsShape,
    async (args) => {
      return runTestsOnBrowserStackHandler(args, config);
    },
  );
}

// For backward compatibility, keep default export as registration
export default registerRunTestsOnBrowserStackTool;
