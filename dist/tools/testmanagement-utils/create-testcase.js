import { apiClient } from "../../lib/apiClient.js";
import { z } from "zod";
import { formatAxiosError } from "../../lib/error.js";
import { projectIdentifierToId } from "./TCG-utils/api.js";
export const CreateTestCaseSchema = z.object({
    project_identifier: z
        .string()
        .describe("The ID of the BrowserStack project where the test case should be created. If no project identifier is provided, ask the user if they would like to create a new project using the createProjectOrFolder tool."),
    folder_id: z
        .string()
        .describe("The ID of the folder within the project where the test case should be created. If not provided, ask the user if they would like to create a new folder using the createProjectOrFolder tool."),
    name: z.string().describe("Name of the test case."),
    description: z
        .string()
        .optional()
        .describe("Brief description of the test case."),
    owner: z
        .string()
        .email()
        .describe("Email of the test case owner.")
        .optional(),
    preconditions: z
        .string()
        .optional()
        .describe("Any preconditions (HTML allowed)."),
    test_case_steps: z
        .array(z.object({
        step: z.string().describe("Action to perform in this step."),
        result: z.string().describe("Expected result of this step."),
    }))
        .describe("List of steps and expected results."),
    issues: z
        .array(z.string())
        .optional()
        .describe("List of the linked Jira, Asana or Azure issues ID's. This should be strictly in array format not the string of json."),
    issue_tracker: z
        .object({
        name: z
            .string()
            .describe("Issue tracker name,  For example, use jira for Jira, azure for Azure DevOps, or asana for Asana."),
        host: z.string().url().describe("Base URL of the issue tracker."),
    })
        .optional(),
    tags: z
        .array(z.string())
        .optional()
        .describe("Tags to attach to the test case. This should be strictly in array format not the string of json"),
    custom_fields: z
        .record(z.string(), z.string())
        .optional()
        .describe("Map of custom field names to values."),
});
export function sanitizeArgs(args) {
    const cleaned = { ...args };
    if (cleaned.description === null)
        delete cleaned.description;
    if (cleaned.owner === null)
        delete cleaned.owner;
    if (cleaned.preconditions === null)
        delete cleaned.preconditions;
    if (cleaned.issue_tracker) {
        if (cleaned.issue_tracker.name === undefined ||
            cleaned.issue_tracker.host === undefined) {
            delete cleaned.issue_tracker;
        }
    }
    return cleaned;
}
import { getBrowserStackAuth } from "../../lib/get-auth.js";
export async function createTestCase(params, config) {
    const body = { test_case: params };
    const authString = getBrowserStackAuth(config);
    const [username, password] = authString.split(":");
    try {
        const response = await apiClient.post({
            url: `https://test-management.browserstack.com/api/v2/projects/${encodeURIComponent(params.project_identifier)}/folders/${encodeURIComponent(params.folder_id)}/test-cases`,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
            },
            body,
        });
        const { data } = response.data;
        if (!data.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to create test case: ${JSON.stringify(response.data)}`,
                        isError: true,
                    },
                ],
                isError: true,
            };
        }
        const tc = data.test_case;
        const projectId = await projectIdentifierToId(params.project_identifier, config);
        return {
            content: [
                {
                    type: "text",
                    text: `Test case successfully created:
            - Identifier: ${tc.identifier}
            - Title: ${tc.title}

          You can view it here: https://test-management.browserstack.com/projects/${projectId}/folder/search?q=${tc.identifier}`,
                },
                {
                    type: "text",
                    text: JSON.stringify(tc, null, 2),
                },
            ],
        };
    }
    catch (err) {
        // Delegate to our centralized Axios error formatter
        return formatAxiosError(err, "Failed to create test case");
    }
}
