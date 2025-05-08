import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  createProjectOrFolder,
  CreateProjFoldSchema,
} from "./testmanagement-utils/create-project-folder";
import {
  createTestCase as createTestCaseAPI,
  TestCaseCreateRequest,
  sanitizeArgs,
  CreateTestCaseSchema,
} from "./testmanagement-utils/create-testcase";

import {
  listTestCases,
  ListTestCasesSchema,
} from "./testmanagement-utils/list-testcases";

import {
  CreateTestRunSchema,
  createTestRun,
} from "./testmanagement-utils/create-testrun";

/**
 * Wrapper to call createProjectOrFolder util.
 */
export async function createProjectOrFolderTool(
  args: z.infer<typeof CreateProjFoldSchema>,
): Promise<CallToolResult> {
  try {
    return await createProjectOrFolder(args);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create project/folder: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Creates a test case in BrowserStack Test Management.
 */
export async function createTestCaseTool(
  args: TestCaseCreateRequest,
): Promise<CallToolResult> {
  // Sanitize input arguments
  const cleanedArgs = sanitizeArgs(args);
  try {
    return await createTestCaseAPI(cleanedArgs);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test case: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists test cases in a project with optional filters (status, priority, custom fields, etc.)
 */

export async function listTestCasesTool(
  args: z.infer<typeof ListTestCasesSchema>,
): Promise<CallToolResult> {
  try {
    return await listTestCases(args);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to list test cases: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}

/**
 * CREATE TEST RUN
 * Creates a test run in BrowserStack Test Management.
 */
export async function createTestRunTool(
  args: z.infer<typeof CreateTestRunSchema>,
): Promise<CallToolResult> {
  try {
    return await createTestRun(args);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test run: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Registers both project/folder and test-case tools.
 */
export default function addTestManagementTools(server: McpServer) {
  server.tool(
    "createProjectOrFolder",
    "Create a project and/or folder in BrowserStack Test Management.",
    CreateProjFoldSchema.shape,
    createProjectOrFolderTool,
  );

  server.tool(
    "createTestCase",
    "Use this tool to create a test case in BrowserStack Test Management.",
    CreateTestCaseSchema.shape,
    createTestCaseTool,
  );

  server.tool(
    "listTestCases",
    "List test cases in a project with optional filters (status, priority, custom fields, etc.)",
    ListTestCasesSchema.shape,
    listTestCasesTool,
  );

  server.tool(
    "createTestRun",
    "Create a test run in BrowserStack Test Management.",
    CreateTestRunSchema.shape,
    createTestRunTool,
  );
}
