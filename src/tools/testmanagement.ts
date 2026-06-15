import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import logger from "../logger.js";
import {
  createProjectOrFolder,
  CreateProjFoldSchema,
} from "./testmanagement-utils/create-project-folder.js";
import {
  createTestCase as createTestCaseAPI,
  TestCaseCreateRequest,
  sanitizeArgs,
  CreateTestCaseSchema,
} from "./testmanagement-utils/create-testcase.js";

import {
  updateTestCase as updateTestCaseAPI,
  TestCaseUpdateRequest,
  UpdateTestCaseSchema,
} from "./testmanagement-utils/update-testcase.js";

import {
  listTestCases,
  ListTestCasesSchema,
} from "./testmanagement-utils/list-testcases.js";

import {
  listFolders,
  ListFoldersSchema,
} from "./testmanagement-utils/list-folders.js";

import {
  CreateTestRunSchema,
  createTestRun,
} from "./testmanagement-utils/create-testrun.js";

import {
  ListTestRunsSchema,
  listTestRuns,
} from "./testmanagement-utils/list-testruns.js";

import {
  UpdateTestRunSchema,
  updateTestRun,
} from "./testmanagement-utils/update-testrun.js";

import {
  addTestResult,
  AddTestResultSchema,
} from "./testmanagement-utils/add-test-result.js";

import {
  UploadFileSchema,
  uploadFile,
} from "./testmanagement-utils/upload-file.js";

import { createTestCasesFromFile } from "./testmanagement-utils/testcase-from-file.js";
import { CreateTestCasesFromFileSchema } from "./testmanagement-utils/TCG-utils/types.js";

import {
  createLCASteps,
  CreateLCAStepsSchema,
} from "./testmanagement-utils/create-lca-steps.js";

import {
  listTestPlans,
  ListTestPlansSchema,
} from "./testmanagement-utils/list-testplans.js";

import {
  getTestPlan,
  GetTestPlanSchema,
} from "./testmanagement-utils/get-testplan.js";

import {
  listSubTestPlans,
  ListSubTestPlansSchema,
} from "./testmanagement-utils/list-sub-testplans.js";

import {
  getSubTestPlan,
  GetSubTestPlanSchema,
} from "./testmanagement-utils/get-sub-testplan.js";

import { BrowserStackConfig } from "../lib/types.js";

/**
 * Wrapper to call createProjectOrFolder util.
 */
export async function createProjectOrFolderTool(
  args: z.infer<typeof CreateProjFoldSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await createProjectOrFolder(args, config);
  } catch (err) {
    logger.error("Failed to create project/folder: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to create project/folder: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
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
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  // Sanitize input arguments
  const cleanedArgs = sanitizeArgs(args);
  try {
    return await createTestCaseAPI(cleanedArgs, config);
  } catch (err) {
    logger.error("Failed to create test case: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test case: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Updates an existing test case in BrowserStack Test Management.
 */
export async function updateTestCaseTool(
  args: TestCaseUpdateRequest,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await updateTestCaseAPI(args, config);
  } catch (err) {
    logger.error("Failed to update test case: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to update test case: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
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
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await listTestCases(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to list test cases: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists folders in a project (or sub-folders under a parent folder).
 */
export async function listFoldersTool(
  args: z.infer<typeof ListFoldersSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await listFolders(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to list folders: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Creates a test run in BrowserStack Test Management.
 */
export async function createTestRunTool(
  args: z.infer<typeof CreateTestRunSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await createTestRun(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test run: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists test runs in a project with optional filters (date ranges, assignee, state, etc.)
 */
export async function listTestRunsTool(
  args: z.infer<typeof ListTestRunsSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await listTestRuns(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to list test runs: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Updates a test run in BrowserStack Test Management.
 * This function allows for partial updates to an existing test run.
 * It takes the project identifier and test run ID as parameters.
 */
export async function updateTestRunTool(
  args: z.infer<typeof UpdateTestRunSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await updateTestRun(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to update test run: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Adds a test result to a specific test run via BrowserStack Test Management API.
 */
export async function addTestResultTool(
  args: z.infer<typeof AddTestResultSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await addTestResult(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to add test result: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Uploads files such as PDRs or screenshots to BrowserStack Test Management and get file mapping ID back.
 */
export async function uploadProductRequirementFileTool(
  args: z.infer<typeof UploadFileSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await uploadFile(args, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to upload file: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Creates test cases from a file in BrowserStack Test Management.
 */
export async function createTestCasesFromFileTool(
  args: z.infer<typeof CreateTestCasesFromFileSchema>,
  context: any,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await createTestCasesFromFile(args, context, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create test cases from file: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Creates LCA (Low Code Automation) steps for a test case in BrowserStack Test Management.
 */
export async function createLCAStepsTool(
  args: z.infer<typeof CreateLCAStepsSchema>,
  context: any,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await createLCASteps(args, context, config);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to create LCA steps: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists test plans in a project.
 */
export async function listTestPlansTool(
  args: z.infer<typeof ListTestPlansSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await listTestPlans(args, config);
  } catch (err) {
    logger.error("Failed to list test plans: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to list test plans: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Fetches a test plan by identifier, with its linked runs and a derived status summary.
 */
export async function getTestPlanTool(
  args: z.infer<typeof GetTestPlanSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await getTestPlan(args, config);
  } catch (err) {
    logger.error("Failed to fetch test plan: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch test plan: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists sub-test-plans under a parent test plan.
 */
export async function listSubTestPlansTool(
  args: z.infer<typeof ListSubTestPlansSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await listSubTestPlans(args, config);
  } catch (err) {
    logger.error("Failed to list sub-test-plans: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to list sub-test-plans: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Fetches a sub-test-plan by identifier, with its linked runs and a derived status summary.
 */
export async function getSubTestPlanTool(
  args: z.infer<typeof GetSubTestPlanSchema>,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    return await getSubTestPlan(args, config);
  } catch (err) {
    logger.error("Failed to fetch sub-test-plan: %s", err);
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch sub-test-plan: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please open an issue on GitHub if the problem persists`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Registers both project/folder and test-case tools.
 */
export default function addTestManagementTools(
  server: McpServer,
  config: BrowserStackConfig,
) {
  const tools: Record<string, any> = {};

  tools.createProjectOrFolder = server.tool(
    "createProjectOrFolder",
    "Create a project and/or folder in BrowserStack Test Management.",
    CreateProjFoldSchema.shape,
    (args) => createProjectOrFolderTool(args, config),
  );

  tools.createTestCase = server.tool(
    "createTestCase",
    "Use this tool to create a test case in BrowserStack Test Management.",
    CreateTestCaseSchema.shape,
    (args) => createTestCaseTool(args, config),
  );

  tools.updateTestCase = server.tool(
    "updateTestCase",
    "Update an existing test case in BrowserStack Test Management. Any subset of the following fields may be changed: name, description, preconditions, test_case_steps, owner, priority, case_type, automation_status, status, tags, issues, custom_fields. Only the supplied fields are modified.",
    UpdateTestCaseSchema.shape,
    (args) => updateTestCaseTool(args, config),
  );

  tools.listTestCases = server.tool(
    "listTestCases",
    "List test cases in a project, optionally scoped to a specific folder. Omit folder_id to list all test cases in the project; provide folder_id (discoverable via listFolders) to list only that folder's cases. Supports filters: case_type, priority, pagination.",
    ListTestCasesSchema.shape,
    (args) => listTestCasesTool(args, config),
  );

  tools.listFolders = server.tool(
    "listFolders",
    "List folders in a BrowserStack Test Management project, returning each folder's id and name (plus case counts and sub-folder counts). Pass parent_id to list sub-folders under a specific folder instead of top-level folders.",
    ListFoldersSchema.shape,
    (args) => listFoldersTool(args, config),
  );

  tools.createTestRun = server.tool(
    "createTestRun",
    "Create a test run in BrowserStack Test Management.",
    CreateTestRunSchema.shape,
    (args) => createTestRunTool(args, config),
  );

  tools.listTestRuns = server.tool(
    "listTestRuns",
    "List test runs in a project with optional filters (date ranges, assignee, state, etc.)",
    ListTestRunsSchema.shape,
    (args) => listTestRunsTool(args, config),
  );

  tools.updateTestRun = server.tool(
    "updateTestRun",
    "Update a test run in BrowserStack Test Management.",
    UpdateTestRunSchema.shape,
    (args) => updateTestRunTool(args, config),
  );

  tools.addTestResult = server.tool(
    "addTestResult",
    "Add a test result to a specific test run via BrowserStack Test Management API.",
    AddTestResultSchema.shape,
    (args) => addTestResultTool(args, config),
  );

  tools.uploadProductRequirementFile = server.tool(
    "uploadProductRequirementFile",
    "Upload files (e.g., PDRs, PDFs) to BrowserStack Test Management and retrieve a file mapping ID. This is utilized for generating test cases from files and is part of the Test Case Generator AI Agent in BrowserStack.",
    UploadFileSchema.shape,
    (args) => uploadProductRequirementFileTool(args, config),
  );

  tools.createTestCasesFromFile = server.tool(
    "createTestCasesFromFile",
    "Generate test cases from a file in BrowserStack Test Management using the Test Case Generator AI Agent.",
    CreateTestCasesFromFileSchema.shape,
    (args, context) => createTestCasesFromFileTool(args, context, config),
  );

  tools.createLCASteps = server.tool(
    "createLCASteps",
    "Generate Low Code Automation (LCA) steps for a test case in BrowserStack Test Management using the Low Code Automation Agent.",
    CreateLCAStepsSchema.shape,
    (args, context) => createLCAStepsTool(args, context, config),
  );

  tools.listTestPlans = server.tool(
    "listTestPlans",
    "List test plans in a BrowserStack Test Management project. Returns each plan's identifier (TP-*), name, status, description, dates, and active/closed test-run counts. Supports pagination.",
    ListTestPlansSchema.shape,
    (args) => listTestPlansTool(args, config),
  );

  tools.getTestPlan = server.tool(
    "getTestPlan",
    "Fetch a test plan by identifier (TP-*) from BrowserStack Test Management. Returns plan metadata, the full list of linked test runs, total test-case count across runs, and a status summary — suitable for generating test documentation or QA status reports.",
    GetTestPlanSchema.shape,
    (args) => getTestPlanTool(args, config),
  );

  tools.listSubTestPlans = server.tool(
    "listSubTestPlans",
    "List sub-test-plans under a parent test plan (TP-*) in a Test Management project. Supports pagination.",
    ListSubTestPlansSchema.shape,
    (args) => listSubTestPlansTool(args, config),
  );

  tools.getSubTestPlan = server.tool(
    "getSubTestPlan",
    "Fetch a sub-test-plan (STP-*) under a parent plan (TP-*). Returns metadata and linked test runs.",
    GetSubTestPlanSchema.shape,
    (args) => getSubTestPlanTool(args, config),
  );

  return tools;
}
