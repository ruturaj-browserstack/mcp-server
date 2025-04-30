import axios, { AxiosError } from "axios";
import config from "../../config";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { TEST_MANAGEMENT_BASE_URL } from "./constants";

// Schema for updating a test case; all updateable fields are optional
export const UpdateTestCaseSchema = z.object({
  project_identifier: z
    .string()
    .describe("Identifier of the project containing the test case."),
  test_case_id: z.string().describe("Identifier of the test case to update."),
  name: z.string().optional().describe("New name of the test case."),
  case_type: z.string().optional().describe("Type of the test case."),
  priority: z.string().optional().describe("Priority of the test case."),
  status: z.string().optional().describe("Status of the test case."),
  description: z
    .string()
    .optional()
    .describe("Brief description of the test case."),
  owner: z
    .string()
    .email()
    .optional()
    .describe("Email of the test case owner."),
  preconditions: z
    .string()
    .optional()
    .describe("Any preconditions (HTML allowed)."),
  test_case_steps: z
    .array(
      z.object({
        step: z.string().describe("Action to perform in this step."),
        result: z.string().describe("Expected result of this step."),
      }),
    )
    .optional()
    .describe("List of steps and expected results."),
  issues: z.array(z.string()).optional().describe("List of linked issue IDs."),
  issue_tracker: z
    .object({
      name: z.string().nullish().describe("Issue tracker name."),
      host: z.string().url().describe("Base URL of the issue tracker."),
    })
    .optional()
    .describe("Issue tracker configuration."),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tags to attach to the test case."),
  custom_fields: z
    .record(z.string(), z.string())
    .optional()
    .describe("Map of custom field names to values."),
  automation_status: z
    .string()
    .optional()
    .describe(
      "Status of the automation process, which should be one of the following values “automated”, “not_automated”, “cannot_be_automated”, “obsolete”, or “automation_not_required”",
    ),
});

// Remove undefined or null update values
function sanitizeUpdateArgs(args: any) {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(args)) {
    if (
      value !== undefined &&
      key !== "project_identifier" &&
      key !== "test_case_id"
    ) {
      if (value === null) continue;
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Updates an existing test case in BrowserStack Test Management.
 */
export async function updateTestCase(
  params: z.infer<typeof UpdateTestCaseSchema>,
): Promise<CallToolResult> {
  const { project_identifier, test_case_id, ...rest } =
    UpdateTestCaseSchema.parse(params);

  const body = { test_case: sanitizeUpdateArgs(rest) };

  try {
    const response = await axios.patch(
      `${TEST_MANAGEMENT_BASE_URL}/projects/${encodeURIComponent(
        project_identifier,
      )}/test-cases/${encodeURIComponent(test_case_id)}`,
      body,
      {
        auth: {
          username: config.browserstackUsername,
          password: config.browserstackAccessKey,
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.data?.success) {
      throw new Error(
        `Failed to update test case: ${JSON.stringify(response.data)}`,
      );
    }

    const updated = response.data.data.test_case;
    return {
      content: [
        {
          type: "text",
          text: `Successfully updated test case ${updated.identifier}: "${updated.title}"`,
        },
        {
          type: "text",
          text: JSON.stringify(updated, null, 2),
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Failed to update test case: ${message}`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}
