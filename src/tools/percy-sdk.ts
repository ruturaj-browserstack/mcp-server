import { BrowserStackConfig } from "../lib/types.js";
import { fetchPercyChanges } from "./review-agent.js";
import { addListTestFiles } from "./list-test-files.js";
import { runPercyScan } from "./run-percy-scan.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SetUpPercyParamsShape } from "./sdk-utils/common/schema.js";
import { updateTestsWithPercyCommands } from "./add-percy-snapshots.js";
import { approveOrDeclinePercyBuild } from "./review-agent-utils/percy-approve-reject.js";
import {
  setUpPercyHandler,
  simulatePercyChangeHandler,
} from "./sdk-utils/handler.js";
import { z } from "zod";
import {
  SETUP_PERCY_DESCRIPTION,
  LIST_TEST_FILES_DESCRIPTION,
  PERCY_SNAPSHOT_COMMANDS_DESCRIPTION,
  SIMULATE_PERCY_CHANGE_DESCRIPTION,
} from "./sdk-utils/common/constants.js";
import { UpdateTestFileWithInstructionsParams } from "./percy-snapshot-utils/constants.js";

import {
  RunPercyScanParamsShape,
  FetchPercyChangesParamsShape,
  ManagePercyBuildApprovalParamsShape,
} from "./sdk-utils/common/schema.js";

export function registerPercyTools(
  server: McpServer,
  config: BrowserStackConfig,
) {
  const tools: Record<string, any> = {};

  server.prompt(
    "integrate-percy",
    {
      project_name: z
        .string()
        .describe("The name of the project to integrate with Percy"),
    },
    async ({ project_name }) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `Integrate percy in this project ${project_name} using tool percyVisualTestIntegrationAgent.`,
            },
          },
        ],
      };
    },
  );

  tools.percyVisualTestIntegrationAgent = server.tool(
    "percyVisualTestIntegrationAgent",
    SIMULATE_PERCY_CHANGE_DESCRIPTION,
    SetUpPercyParamsShape,
    async (args) => simulatePercyChangeHandler(args, config),
  );

  tools.setupPercyVisualTesting = server.tool(
    "expandPercyVisualTesting",
    SETUP_PERCY_DESCRIPTION,
    SetUpPercyParamsShape,
    async (args) => setUpPercyHandler(args, config),
  );

  tools.addPercySnapshotCommands = server.tool(
    "addPercySnapshotCommands",
    PERCY_SNAPSHOT_COMMANDS_DESCRIPTION,
    UpdateTestFileWithInstructionsParams,
    async (args) => updateTestsWithPercyCommands(args),
  );

  tools.listTestFiles = server.tool(
    "listTestFiles",
    LIST_TEST_FILES_DESCRIPTION,
    {},
    async () => addListTestFiles(),
  );

  tools.runPercyScan = server.tool(
    "runPercyScan",
    "Run a Percy visual test scan. Example prompts : Run this Percy build/scan. Never run percy scan/build without this tool",
    RunPercyScanParamsShape,
    async (args) => runPercyScan(args),
  );

  tools.fetchPercyChanges = server.tool(
    "fetchPercyChanges",
    "Retrieves and summarizes all visual changes detected by Percy AI between the latest and previous builds, helping quickly review what has changed in your project.",
    FetchPercyChangesParamsShape,
    async (args) => fetchPercyChanges(args, config),
  );

  tools.managePercyBuildApproval = server.tool(
    "managePercyBuildApproval",
    "Approve or reject a Percy build",
    ManagePercyBuildApprovalParamsShape,
    async (args) => approveOrDeclinePercyBuild(args, config),
  );

  return tools;
}

export default registerPercyTools;
