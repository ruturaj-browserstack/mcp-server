import { apiClient } from "../../lib/apiClient.js";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAxiosError } from "../../lib/error.js";
import { projectIdentifierToId } from "./TCG-utils/api.js";
import { BrowserStackConfig } from "../../lib/types.js";
import { getTMBaseURL } from "../../lib/tm-base-url.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";

interface TestCaseStep {
  step: string;
  result: string;
}

interface IssueTracker {
  name: string;
  host: string;
}

export interface TestCaseUpdateRequest {
  project_identifier: string;
  test_case_id: string;
  name?: string;
  description?: string;
  owner?: string;
  preconditions?: string;
  test_case_steps?: TestCaseStep[];
  issues?: string[];
  issue_tracker?: IssueTracker;
  tags?: string[];
  custom_fields?: Record<string, string>;
  automation_status?: string;
  priority?: string;
  case_type?: string;
}

export interface TestCaseUpdateResponse {
  data: {
    success: boolean;
    test_case: {
      case_type: string;
      priority: string;
      status: string;
      folder_id: number;
      issues: Array<{
        jira_id: string;
        issue_type: string;
      }>;
      tags: string[];
      template: string;
      description: string;
      preconditions: string;
      title: string;
      identifier: string;
      automation_status: string;
      owner: string;
      steps: TestCaseStep[];
      custom_fields: Array<{
        name: string;
        value: string;
      }>;
    };
  };
}

export const UpdateTestCaseSchema = z.object({
  project_identifier: z
    .string()
    .describe(
      "The ID of the BrowserStack project containing the test case to update.",
    ),
  test_case_id: z
    .string()
    .describe(
      "The ID of the test case to update. This can be found using the listTestCases tool.",
    ),
  name: z.string().optional().describe("Updated name of the test case."),
  description: z
    .string()
    .optional()
    .describe("Updated brief description of the test case."),
  owner: z
    .string()
    .email()
    .describe("Updated email of the test case owner.")
    .optional(),
  preconditions: z
    .string()
    .optional()
    .describe("Updated preconditions (HTML allowed)."),
  test_case_steps: z
    .array(
      z.object({
        step: z.string().describe("Action to perform in this step."),
        result: z.string().describe("Expected result of this step."),
      }),
    )
    .optional()
    .describe("Updated list of steps and expected results."),
  issues: z
    .array(z.string())
    .optional()
    .describe(
      "Updated list of linked Jira, Asana or Azure issues ID's. This should be strictly in array format.",
    ),
  issue_tracker: z
    .object({
      name: z
        .string()
        .describe(
          "Issue tracker name,  For example, use jira for Jira, azure for Azure DevOps, or asana for Asana.",
        ),
      host: z.string().url().describe("Base URL of the issue tracker."),
    })
    .optional()
    .describe("Updated issue tracker configuration"),
  tags: z
    .array(z.string())
    .optional()
    .describe(
      "Updated tags to attach to the test case. This should be strictly in array format.",
    ),
  custom_fields: z
    .record(z.string())
    .optional()
    .describe("Updated map of custom field names to values."),
  automation_status: z
    .string()
    .optional()
    .describe(
      "Updated automation status of the test case. Common values include 'not_automated', 'automated', 'automation_not_required'.",
    ),
  priority: z
    .string()
    .optional()
    .describe(
      "Updated priority level (e.g., 'critical', 'high', 'medium', 'low').",
    ),
  case_type: z
    .string()
    .optional()
    .describe("Updated case type (e.g., 'functional', 'regression', 'smoke')."),
});

export function sanitizeUpdateArgs(args: any) {
  const cleaned = { ...args };

  // Remove null values and undefined
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === null || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });

  if (cleaned.issue_tracker) {
    if (
      cleaned.issue_tracker.name === undefined ||
      cleaned.issue_tracker.host === undefined
    ) {
      delete cleaned.issue_tracker;
    }
  }

  return cleaned;
}

/**
 * Updates an existing test case in BrowserStack Test Management.
 */
export async function updateTestCase(
  params: TestCaseUpdateRequest,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  const authString = getBrowserStackAuth(config);
  const [username, password] = authString.split(":");

  // Convert project identifier to project ID first
  const projectId = await projectIdentifierToId(
    params.project_identifier,
    config,
  );

  // Build the request body
  const body: any = {
    title: params.name,
    description: params.description,
    preconditions: params.preconditions,
    automation_status: params.automation_status,
    priority: params.priority,
    case_type: params.case_type,
    owner: params.owner,
  };

  // Add steps if provided
  if (params.test_case_steps) {
    body.steps = params.test_case_steps;
  }

  // Add tags if provided
  if (params.tags) {
    body.tags = params.tags;
  }

  // Add issues if provided
  if (params.issues && params.issues.length > 0) {
    if (params.issue_tracker) {
      body.issues = params.issues.map((issue) => ({
        jira_id: issue,
        issue_type: "story", // default type, can be customized
      }));
      body.issue_tracker = params.issue_tracker;
    }
  }

  // Add custom fields if provided
  if (params.custom_fields) {
    body.custom_fields = Object.entries(params.custom_fields).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );
  }

  // Remove undefined values
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key];
    }
  });

  try {
    const tmBaseUrl = await getTMBaseURL(config);
    const response = await apiClient.put({
      url: `${tmBaseUrl}/api/v2/projects/${encodeURIComponent(
        projectId.toString(),
      )}/test-cases/${encodeURIComponent(params.test_case_id)}`,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
      },
      body,
    });

    const { data } = response.data;
    if (!data.success) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to update test case: ${JSON.stringify(
              response.data,
            )}`,
            isError: true,
          },
        ],
        isError: true,
      };
    }

    const tc = data.test_case;

    return {
      content: [
        {
          type: "text",
          text: `Test case successfully updated:
          
**Test Case Details:**
- **ID**: ${tc.identifier}
- **Name**: ${tc.title}
- **Description**: ${tc.description || "N/A"}
- **Owner**: ${tc.owner || "N/A"}
- **Priority**: ${tc.priority}
- **Case Type**: ${tc.case_type}
- **Automation Status**: ${tc.automation_status || "N/A"}
- **Preconditions**: ${tc.preconditions || "N/A"}
- **Tags**: ${tc.tags?.join(", ") || "None"}
- **Steps**: ${tc.steps?.length || 0} steps
- **Custom Fields**: ${tc.custom_fields?.length || 0} fields

**View on BrowserStack Dashboard:**
https://test-management.browserstack.com/projects/${projectId}/folders/${tc.folder_id}/test-cases/${tc.identifier}

The test case has been updated successfully and is now available in your BrowserStack Test Management project.`,
        },
      ],
    };
  } catch (err: any) {
    console.error("Update test case error:", err);

    if (err.response?.status === 404) {
      return {
        content: [
          {
            type: "text",
            text: `Test case not found. Please verify the project_identifier ("${params.project_identifier}") and test_case_id ("${params.test_case_id}") are correct. Make sure to use actual values, not placeholders like "your_project_id".`,
            isError: true,
          },
        ],
        isError: true,
      };
    }

    if (err.response?.status === 403) {
      return {
        content: [
          {
            type: "text",
            text: "Access denied. You don't have permission to update this test case.",
            isError: true,
          },
        ],
        isError: true,
      };
    }

    const errorMessage = formatAxiosError(err, "Failed to update test case");
    return {
      content: [
        {
          type: "text",
          text: `Failed to update test case: ${errorMessage}. Please verify your credentials and try again.`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}
