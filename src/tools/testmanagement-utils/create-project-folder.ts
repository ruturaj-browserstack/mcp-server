import axios, { AxiosError } from "axios";
import config from "../../config";
import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { TEST_MANAGEMENT_BASE_URL } from "./constants";

// Schema for combined project/folder creation
export const CreateProjFoldSchema = z.object({
  project_name: z
    .string()
    .optional()
    .describe("Name of the project to create."),
  project_description: z
    .string()
    .optional()
    .describe("Description for the new project."),
  project_identifier: z
    .string()
    .optional()
    .describe("Existing project identifier to use for folder creation."),
  folder_name: z.string().optional().describe("Name of the folder to create."),
  folder_description: z
    .string()
    .optional()
    .describe("Description for the new folder."),
  parent_id: z
    .number()
    .optional()
    .describe("Parent folder ID; if omitted, folder is created at root."),
});

type CreateProjFoldArgs = z.infer<typeof CreateProjFoldSchema>;

/**
 * Creates a project and/or folder in BrowserStack Test Management.
 */
export async function createProjectOrFolder(
  args: CreateProjFoldArgs,
): Promise<CallToolResult> {
  const {
    project_name,
    project_description,
    project_identifier,
    folder_name,
    folder_description,
    parent_id,
  } = CreateProjFoldSchema.parse(args);

  if (!project_name && !project_identifier && !folder_name) {
    throw new Error(
      "Provide project_name (to create project), or project_identifier and folder_name (to create folder).",
    );
  }

  let projId = project_identifier;

  // Step 1: Create project if project_name provided
  if (project_name) {
    try {
      const res = await axios.post(
        TEST_MANAGEMENT_BASE_URL + "/projects",
        { project: { name: project_name, description: project_description } },
        {
          auth: {
            username: config.browserstackUsername,
            password: config.browserstackAccessKey,
          },
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.data.success) {
        throw new Error(
          `Failed to create project: ${JSON.stringify(res.data)}`,
        );
      }
      // Project created successfully

      projId = res.data.project.identifier;
    } catch (err) {
      let text = "Failed to create project.";

      if (err instanceof AxiosError && err.response?.data) {
        const { error } = err.response.data;
        const status = err.response.status;

        if (status >= 400 && status < 500 && error) {
          text = error;
        }
      } else if (err instanceof Error) {
        text = err.message;
      }

      return {
        content: [{ type: "text", text }],
        isError: true,
      };
    }
  }
  // Step 2: Create folder if folder_name provided
  if (folder_name) {
    if (!projId)
      throw new Error("Cannot create folder without project_identifier.");
    try {
      const res = await axios.post(
        `${TEST_MANAGEMENT_BASE_URL}/projects/${encodeURIComponent(
          projId,
        )}/folders`,
        {
          folder: {
            name: folder_name,
            description: folder_description,
            parent_id,
          },
        },
        {
          auth: {
            username: config.browserstackUsername,
            password: config.browserstackAccessKey,
          },
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.data.success) {
        throw new Error(`Failed to create folder: ${JSON.stringify(res.data)}`);
      }
      // Folder created successfully

      const folder = res.data.folder;
      return {
        content: [
          {
            type: "text",
            text: `Folder created: ID=${folder.id}, name="${folder.name}" in project with identifier ${projId}`,
          },
        ],
      };
    } catch (err) {
      let text = "Failed to create folder.";

      if (err instanceof AxiosError && err.response?.data) {
        const { message: apiMessage } = err.response.data;
        const status = err.response.status;

        if (status >= 400 && status < 500 && apiMessage) {
          text = apiMessage;
        }
      } else if (err instanceof Error) {
        text = err.message;
      }

      return {
        content: [{ type: "text", text }],
        isError: true,
      };
    }
  }

  // Only project was created
  return {
    content: [
      { type: "text", text: `Project created with identifier=${projId}` },
    ],
  };
}
