import axios from "axios";
import config from "../../config";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { TEST_MANAGEMENT_BASE_URL } from "./constants";

/**
 * Schema for listing test cases with optional filters.
 */
export const ListTestCasesSchema = z.object({
  project_identifier: z
    .string()
    .describe("Identifier of the project to fetch test cases for."),
  id: z
    .array(z.string())
    .optional()
    .describe('Filter by test case identifiers, e.g., ["TC-16667","TC-1046"].'),
  status: z
    .array(z.string())
    .optional()
    .describe('Filter by status values, e.g., ["active","draft"].'),
  priority: z
    .array(z.string())
    .optional()
    .describe('Filter by priority values, e.g., ["high","low"].'),
  owner: z.array(z.string()).optional().describe("Filter by owner emails."),
  case_type: z
    .array(z.string())
    .optional()
    .describe('Filter by case types, e.g., ["regression","smoke"].'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Filter by tags, e.g., ["test","regression"].'),
  folder_id: z
    .array(z.string())
    .optional()
    .describe('Filter by folder IDs, e.g., ["10","11"].'),
  custom_fields: z
    .record(z.array(z.string()))
    .optional()
    .describe("Filter by custom fields, key to array of values."),
  p: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Page number for pagination."),
});

// Type alias for filters (excluding project_identifier)
type ListTestCasesFilters = Omit<
  z.infer<typeof ListTestCasesSchema>,
  "project_identifier"
>;

/**
 * Build query parameters from filter arguments.
 */
function buildQueryParams(args: ListTestCasesFilters) {
  const params: Record<string, any> = {};

  if (args.id) params.id = args.id.join(",");
  if (args.status) params.status = args.status.join(",");
  if (args.priority) params.priority = args.priority.join(",");
  if (args.owner) params.owner = args.owner.join(",");
  if (args.case_type) params.case_type = args.case_type.join(",");
  if (args.tags) params.tags = args.tags.join(",");
  if (args.folder_id) params.folder_id = args.folder_id.join(",");
  if (args.p) params.p = args.p;

  if (args.custom_fields) {
    for (const [key, vals] of Object.entries(args.custom_fields)) {
      // vals is string[] per schema
      params[`custom_fields[${key}]`] = (vals as string[]).join(",");
    }
  }

  return params;
}

/**
 * Fetches a list of test cases matching the provided filters.
 */
export async function listTestCases(
  params: z.infer<typeof ListTestCasesSchema>,
): Promise<CallToolResult> {
  const { project_identifier, ...filters } = ListTestCasesSchema.parse(params);

  const queryParams = buildQueryParams(filters as ListTestCasesFilters);

  try {
    const response = await axios.get(
      `${TEST_MANAGEMENT_BASE_URL}/projects/${encodeURIComponent(
        project_identifier,
      )}/test-cases`,
      {
        auth: {
          username: config.browserstackUsername,
          password: config.browserstackAccessKey,
        },
        headers: { "Content-Type": "application/json" },
        params: queryParams,
      },
    );

    const data = response.data;
    return {
      content: [
        {
          type: "text",
          text: `Fetched ${data.test_cases.length} test case(s).`,
        },
        { type: "text", text: JSON.stringify(data, null, 2) },
      ],
    };
  } catch (error) {
    const msg =
      axios.isAxiosError(error) && error.response?.statusText
        ? error.response.statusText
        : error instanceof Error
          ? error.message
          : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch test cases: ${msg}`,
          isError: true,
        },
      ],
      isError: true,
    };
  }
}
