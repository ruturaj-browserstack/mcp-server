import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrowserStackConfig } from "../lib/types.js";
import { RunTestsOnBrowserStackParamsShape } from "./sdk-utils/common/schema.js";
import { runTestsOnBrowserStackHandler } from "./sdk-utils/handler.js";

/**
 * Tool description for runTestsOnBrowserStack
 */
const TOOL_DESCRIPTION = `Use this tool to get instructions for running tests on BrowserStack and BrowserStack Percy. For percy user may ask to run on browsestack infra or their own infra.`;

/**
 * Registers the runTestsOnBrowserStack tool with the MCP server.
 * All logic, schema, and error messages are modularized for testability and maintainability.
 */
export function registerRunTestsOnBrowserStackTool(
  server: McpServer,
  config: BrowserStackConfig,
) {
  server.tool(
    "assistRunTestCases",
    TOOL_DESCRIPTION,
    RunTestsOnBrowserStackParamsShape,
    async (args) => {
      return runTestsOnBrowserStackHandler(args, config, "default-project");
    },
  );
}

// For backward compatibility, keep default export as registration
export default registerRunTestsOnBrowserStackTool;
