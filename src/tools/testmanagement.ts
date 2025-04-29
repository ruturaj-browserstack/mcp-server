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
    {
      project_identifier: z
        .string()
        .describe(
          "The ID of the BrowserStack project in which to create the test case. Ask User if he want to create a new project if no project ID is provided using createProjectOrFolder tool.",
        ),
      folder_id: z
        .string()
        .describe(
          "The ID of the folder under the project to create the test case in. If omitted, Ask user if he wants to create a new folder createProjectOrFolder tool.",
        ),
      name: z.string().describe("Name of the test case."),
      description: z
        .string()
        .optional()
        .nullish()
        .describe("Brief description of the test case."),
      owner: z
        .string()
        .email()
        .describe("Email of the test case owner.")
        .optional()
        .nullish(),
      preconditions: z
        .string()
        .optional()
        .nullish()
        .describe("Any preconditions (HTML allowed)."),
      test_case_steps: z
        .array(
          z.object({
            step: z.string().describe("Action to perform in this step."),
            result: z.string().describe("Expected result of this step."),
          }),
        )
        .describe("List of steps and expected results."),
      issues: z
        .array(z.string())
        .optional()
        .describe(
          "List of the linked Jira, Asana or Azure issues ID's. This should be strictly in array format not the string of json.",
        ),
      issue_tracker: z
        .object({
          name: z
            .string()
            .nullish()
            .describe(
              "Issue tracker name,  For example, use jira for Jira, azure for Azure DevOps, or asana for Asana ​",
            ),
          host: z
            .string()
            .url()
            .describe("Base URL of the issue tracker.")
            .nullish(),
        })
        .optional(),
      tags: z
        .array(z.string())
        .optional()
        .describe(
          "Tags to attach to the test case. This should be strictly in array format not the string of json",
        ),
      custom_fields: z
        .record(z.string(), z.string())
        .optional()
        .describe("Map of custom field names to values."),
    },
    async (args) => {
      return createTestCaseTool(args as TestCaseCreateRequest);
    },
  );
}
