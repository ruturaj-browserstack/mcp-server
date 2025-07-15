import { apiClient } from "../../lib/apiClient.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";
import { z } from "zod";
/**
 * Schema for adding a test result to a test run.
 */
export const AddTestResultSchema = z.object({
    project_identifier: z
        .string()
        .describe("Identifier of the project (Starts with 'PR-')"),
    test_run_id: z.string().describe("Identifier of the test run (e.g., TR-678)"),
    test_result: z.object({
        status: z
            .string()
            .describe("Status of the test result, e.g., 'passed', 'failed'."),
        description: z
            .string()
            .optional()
            .describe("Optional description of the test result."),
    }),
    test_case_id: z
        .string()
        .describe("Identifier of the test case, e.g., 'TC-13'."),
});
/**
 * Adds a test result to a specific test run via BrowserStack Test Management API.
 */
export async function addTestResult(rawArgs, config) {
    try {
        const args = AddTestResultSchema.parse(rawArgs);
        const url = `https://test-management.browserstack.com/api/v2/projects/${encodeURIComponent(args.project_identifier)}/test-runs/${encodeURIComponent(args.test_run_id)}/results`;
        const body = {
            test_result: args.test_result,
            test_case_id: args.test_case_id,
        };
        const authString = getBrowserStackAuth(config);
        const [username, password] = authString.split(":");
        const response = await apiClient.post({
            url,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
            },
            body,
        });
        const data = response.data;
        if (!data.success) {
            throw new Error(`API returned unsuccessful response: ${JSON.stringify(data)}`);
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully added test result with ID=${data["test-result"].id}`,
                },
                { type: "text", text: JSON.stringify(data["test-result"], null, 2) },
            ],
        };
    }
    catch (err) {
        const msg = err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            String(err);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to add test result to test run: ${msg}`,
                },
            ],
        };
    }
}
