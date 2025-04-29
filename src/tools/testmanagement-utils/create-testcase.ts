import axios, { AxiosError } from "axios";
import config from "../../config";

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
      `https://test-management.browserstack.com/api/v2/projects/${project_identifier}/folders/${folder_id}/test-cases`,
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
