import axios, { AxiosError } from "axios";
import config from "../../config";
import { z } from "zod";
import { TEST_MANAGEMENT_BASE_URL } from "./constants";

interface TestCaseStep {
  step: string;
  result: string;
}

interface IssueTracker {
  name: string;
  host: string;
}

export interface TestCaseCreateRequest {
  project_identifier: string;
  folder_id: string;
  name: string;
  description?: string;
  owner?: string;
  preconditions?: string;
  test_case_steps: TestCaseStep[];
  issues?: string[];
  issue_tracker?: IssueTracker;
  tags?: string[];
  custom_fields?: Record<string, string>;
}

export interface TestCaseResponse {
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

export const CreateTestCaseSchema = z.object({
  project_identifier: z
    .string()
    .describe(
      "The ID of the BrowserStack project where the test case should be created. If no project identifier is provided, ask the user if they would like to create a new project using the createProjectOrFolder tool.",
    ),
  folder_id: z
    .string()
    .describe(
      "The ID of the folder within the project where the test case should be created. If not provided, ask the user if they would like to create a new folder using the createProjectOrFolder tool.",
    ),
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
        .describe(
          "Issue tracker name,  For example, use jira for Jira, azure for Azure DevOps, or asana for Asana ​",
        ),
      host: z.string().url().describe("Base URL of the issue tracker."),
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
});

export function sanitizeArgs(args: any) {
  const cleaned = { ...args };

  if (cleaned.description === null) delete cleaned.description;
  if (cleaned.owner === null) delete cleaned.owner;
  if (cleaned.preconditions === null) delete cleaned.preconditions;

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

export async function createTestCase(
  params: TestCaseCreateRequest,
): Promise<TestCaseResponse> {
  const {
    project_identifier,
    folder_id,
    name,
    description,
    owner,
    preconditions,
    test_case_steps,
    issues,
    issue_tracker,
    tags,
    custom_fields,
  } = params;

  const body = {
    test_case: {
      name,
      description,
      owner,
      preconditions,
      test_case_steps,
      issues,
      issue_tracker,
      tags,
      custom_fields,
    },
  };

  try {
    const response = await axios.post<TestCaseResponse>(
      `${TEST_MANAGEMENT_BASE_URL}/projects/${project_identifier}/folders/${folder_id}/test-cases`,
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

    // Check if the response indicates success
    if (!response.data.data.success) {
      throw new Error(
        `Failed to create test case: ${JSON.stringify(response.data)}`,
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        throw new Error(
          `Failed to create test case: ${error.response.data.message}`,
        );
      } else {
        throw new Error(`Failed to create test case: ${error.message}`);
      }
    }
    throw error;
  }
}
