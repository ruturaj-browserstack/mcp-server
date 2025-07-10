import { trackMCP } from "../lib/instrumentation.js";
import logger from "../logger.js";
import { createProjectOrFolder, CreateProjFoldSchema, } from "./testmanagement-utils/create-project-folder.js";
import { createTestCase as createTestCaseAPI, sanitizeArgs, CreateTestCaseSchema, } from "./testmanagement-utils/create-testcase.js";
import { listTestCases, ListTestCasesSchema, } from "./testmanagement-utils/list-testcases.js";
import { CreateTestRunSchema, createTestRun, } from "./testmanagement-utils/create-testrun.js";
import { ListTestRunsSchema, listTestRuns, } from "./testmanagement-utils/list-testruns.js";
import { UpdateTestRunSchema, updateTestRun, } from "./testmanagement-utils/update-testrun.js";
import { addTestResult, AddTestResultSchema, } from "./testmanagement-utils/add-test-result.js";
import { UploadFileSchema, uploadFile, } from "./testmanagement-utils/upload-file.js";
import { createTestCasesFromFile } from "./testmanagement-utils/testcase-from-file.js";
import { CreateTestCasesFromFileSchema } from "./testmanagement-utils/TCG-utils/types.js";
import { createLCASteps, CreateLCAStepsSchema, } from "./testmanagement-utils/create-lca-steps.js";
//TODO: Moving the traceMCP and catch block to the parent(server) function
/**
 * Wrapper to call createProjectOrFolder util.
 */
export async function createProjectOrFolderTool(args, config, server) {
    try {
        trackMCP("createProjectOrFolder", server.server.getClientVersion(), undefined, config);
        return await createProjectOrFolder(args, config);
    }
    catch (err) {
        logger.error("Failed to create project/folder: %s", err);
        trackMCP("createProjectOrFolder", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create project/folder: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
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
export async function createTestCaseTool(args, config, server) {
    // Sanitize input arguments
    const cleanedArgs = sanitizeArgs(args);
    try {
        trackMCP("createTestCase", server.server.getClientVersion(), undefined, config);
        return await createTestCaseAPI(cleanedArgs, config);
    }
    catch (err) {
        logger.error("Failed to create test case: %s", err);
        trackMCP("createTestCase", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create test case: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
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
export async function listTestCasesTool(args, config, server) {
    try {
        trackMCP("listTestCases", server.server.getClientVersion(), undefined, config);
        return await listTestCases(args, config);
    }
    catch (err) {
        trackMCP("listTestCases", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to list test cases: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Creates a test run in BrowserStack Test Management.
 */
export async function createTestRunTool(args, config, server) {
    try {
        trackMCP("createTestRun", server.server.getClientVersion(), undefined, config);
        return await createTestRun(args, config);
    }
    catch (err) {
        trackMCP("createTestRun", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create test run: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Lists test runs in a project with optional filters (date ranges, assignee, state, etc.)
 */
export async function listTestRunsTool(args, config, server) {
    try {
        trackMCP("listTestRuns", server.server.getClientVersion(), undefined, config);
        return await listTestRuns(args, config);
    }
    catch (err) {
        trackMCP("listTestRuns", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to list test runs: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
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
export async function updateTestRunTool(args, config, server) {
    try {
        trackMCP("updateTestRun", server.server.getClientVersion(), undefined, config);
        return await updateTestRun(args, config);
    }
    catch (err) {
        trackMCP("updateTestRun", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to update test run: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Adds a test result to a specific test run via BrowserStack Test Management API.
 */
export async function addTestResultTool(args, config, server) {
    try {
        trackMCP("addTestResult", server.server.getClientVersion(), undefined, config);
        return await addTestResult(args, config);
    }
    catch (err) {
        trackMCP("addTestResult", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to add test result: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Uploads files such as PDRs or screenshots to BrowserStack Test Management and get file mapping ID back.
 */
export async function uploadProductRequirementFileTool(args, config, server) {
    try {
        trackMCP("uploadProductRequirementFile", server.server.getClientVersion(), undefined, config);
        return await uploadFile(args, config);
    }
    catch (err) {
        trackMCP("uploadProductRequirementFile", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to upload file: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Creates test cases from a file in BrowserStack Test Management.
 */
export async function createTestCasesFromFileTool(args, context, config, server) {
    try {
        trackMCP("createTestCasesFromFile", server.server.getClientVersion(), undefined);
        return await createTestCasesFromFile(args, context, config);
    }
    catch (err) {
        trackMCP("createTestCasesFromFile", server.server.getClientVersion(), err);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create test cases from file: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
                    isError: true,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Creates LCA (Low Code Automation) steps for a test case in BrowserStack Test Management.
 */
export async function createLCAStepsTool(args, context, config, server) {
    try {
        trackMCP("createLCASteps", server.server.getClientVersion(), undefined, config);
        return await createLCASteps(args, context, config);
    }
    catch (err) {
        trackMCP("createLCASteps", server.server.getClientVersion(), err, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create LCA steps: ${err instanceof Error ? err.message : "Unknown error"}. Please open an issue on GitHub if the problem persists`,
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
export default function addTestManagementTools(server, config) {
    server.tool("createProjectOrFolder", "Create a project and/or folder in BrowserStack Test Management.", CreateProjFoldSchema.shape, (args) => createProjectOrFolderTool(args, config, server));
    server.tool("createTestCase", "Use this tool to create a test case in BrowserStack Test Management.", CreateTestCaseSchema.shape, (args) => createTestCaseTool(args, config, server));
    server.tool("listTestCases", "List test cases in a project with optional filters (status, priority, custom fields, etc.)", ListTestCasesSchema.shape, (args) => listTestCasesTool(args, config, server));
    server.tool("createTestRun", "Create a test run in BrowserStack Test Management.", CreateTestRunSchema.shape, (args) => createTestRunTool(args, config, server));
    server.tool("listTestRuns", "List test runs in a project with optional filters (date ranges, assignee, state, etc.)", ListTestRunsSchema.shape, (args) => listTestRunsTool(args, config, server));
    server.tool("updateTestRun", "Update a test run in BrowserStack Test Management.", UpdateTestRunSchema.shape, (args) => updateTestRunTool(args, config, server));
    server.tool("addTestResult", "Add a test result to a specific test run via BrowserStack Test Management API.", AddTestResultSchema.shape, (args) => addTestResultTool(args, config, server));
    server.tool("uploadProductRequirementFile", "Upload files (e.g., PDRs, PDFs) to BrowserStack Test Management and retrieve a file mapping ID. This is utilized for generating test cases from files and is part of the Test Case Generator AI Agent in BrowserStack.", UploadFileSchema.shape, (args) => uploadProductRequirementFileTool(args, config, server));
    server.tool("createTestCasesFromFile", "Generate test cases from a file in BrowserStack Test Management using the Test Case Generator AI Agent.", CreateTestCasesFromFileSchema.shape, (args, context) => createTestCasesFromFileTool(args, context, config, server));
    server.tool("createLCASteps", "Generate Low Code Automation (LCA) steps for a test case in BrowserStack Test Management using the Low Code Automation Agent.", CreateLCAStepsSchema.shape, (args, context) => createLCAStepsTool(args, context, config, server));
}
