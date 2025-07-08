import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { CreateProjFoldSchema } from "./testmanagement-utils/create-project-folder.js";
import { TestCaseCreateRequest } from "./testmanagement-utils/create-testcase.js";
import { ListTestCasesSchema } from "./testmanagement-utils/list-testcases.js";
import { CreateTestRunSchema } from "./testmanagement-utils/create-testrun.js";
import { ListTestRunsSchema } from "./testmanagement-utils/list-testruns.js";
import { UpdateTestRunSchema } from "./testmanagement-utils/update-testrun.js";
import { AddTestResultSchema } from "./testmanagement-utils/add-test-result.js";
import { UploadFileSchema } from "./testmanagement-utils/upload-file.js";
import { CreateTestCasesFromFileSchema } from "./testmanagement-utils/TCG-utils/types.js";
import { CreateLCAStepsSchema } from "./testmanagement-utils/create-lca-steps.js";
import { BrowserStackConfig } from "../lib/types.js";
/**
 * Wrapper to call createProjectOrFolder util.
 */
export declare function createProjectOrFolderTool(args: z.infer<typeof CreateProjFoldSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Creates a test case in BrowserStack Test Management.
 */
export declare function createTestCaseTool(args: TestCaseCreateRequest, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Lists test cases in a project with optional filters (status, priority, custom fields, etc.)
 */
export declare function listTestCasesTool(args: z.infer<typeof ListTestCasesSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Creates a test run in BrowserStack Test Management.
 */
export declare function createTestRunTool(args: z.infer<typeof CreateTestRunSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Lists test runs in a project with optional filters (date ranges, assignee, state, etc.)
 */
export declare function listTestRunsTool(args: z.infer<typeof ListTestRunsSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Updates a test run in BrowserStack Test Management.
 * This function allows for partial updates to an existing test run.
 * It takes the project identifier and test run ID as parameters.
 */
export declare function updateTestRunTool(args: z.infer<typeof UpdateTestRunSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Adds a test result to a specific test run via BrowserStack Test Management API.
 */
export declare function addTestResultTool(args: z.infer<typeof AddTestResultSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Uploads files such as PDRs or screenshots to BrowserStack Test Management and get file mapping ID back.
 */
export declare function uploadProductRequirementFileTool(args: z.infer<typeof UploadFileSchema>, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Creates test cases from a file in BrowserStack Test Management.
 */
export declare function createTestCasesFromFileTool(args: z.infer<typeof CreateTestCasesFromFileSchema>, context: any, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Creates LCA (Low Code Automation) steps for a test case in BrowserStack Test Management.
 */
export declare function createLCAStepsTool(args: z.infer<typeof CreateLCAStepsSchema>, context: any, config: BrowserStackConfig, server: McpServer): Promise<CallToolResult>;
/**
 * Registers both project/folder and test-case tools.
 */
export default function addTestManagementTools(server: McpServer, config: BrowserStackConfig): void;
