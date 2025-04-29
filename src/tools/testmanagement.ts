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

/**
 * Wrapper to call createProjectOrFolder util.
 */
export async function createProjectOrFolderTool(
  args: z.infer<typeof CreateProjFoldSchema>,
): Promise<CallToolResult> {
  try {
    return await createProjectOrFolder(args);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Failed to create project/folder: ${msg}`,
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
    const response = await createTestCaseAPI(cleanedArgs);
    const testCase = response.data.test_case;

    return {
      content: [
        {
          type: "text",
          text: `Successfully created test case ${testCase.identifier}: "${testCase.title}"`,
        },
        {
          type: "text",
          text: JSON.stringify(testCase, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test case: ${
            error instanceof Error ? error.message : "Unknown error"
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
    async (args) => {
      return createTestCaseTool(args as TestCaseCreateRequest);
    },
  );
}
