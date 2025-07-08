import { apiClient } from "../../lib/apiClient.js";
import { z } from "zod";
import { formatAxiosError } from "../../lib/error.js";
import { projectIdentifierToId } from "../testmanagement-utils/TCG-utils/api.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";
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
/**
 * Creates a project and/or folder in BrowserStack Test Management.
 */
export async function createProjectOrFolder(args, config) {
    const { project_name, project_description, project_identifier, folder_name, folder_description, parent_id, } = CreateProjFoldSchema.parse(args);
    if (!project_name && !project_identifier && !folder_name) {
        throw new Error("Provide project_name (to create project), or project_identifier and folder_name (to create folder).");
    }
    const authString = getBrowserStackAuth(config);
    const [username, password] = authString.split(":");
    let projId = project_identifier;
    // Step 1: Create project if project_name provided
    if (project_name) {
        try {
            const authString = getBrowserStackAuth(config);
            const [username, password] = authString.split(":");
            const res = await apiClient.post({
                url: "https://test-management.browserstack.com/api/v2/projects",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic " +
                        Buffer.from(`${username}:${password}`).toString("base64"),
                },
                body: {
                    project: { name: project_name, description: project_description },
                },
            });
            if (!res.data.success) {
                throw new Error(`Failed to create project: ${JSON.stringify(res.data)}`);
            }
            // Project created successfully
            projId = res.data.project.identifier;
        }
        catch (err) {
            return formatAxiosError(err, "Failed to create project.");
        }
    }
    // Step 2: Create folder if folder_name provided
    if (folder_name) {
        if (!projId)
            throw new Error("Cannot create folder without project_identifier.");
        try {
            const res = await apiClient.post({
                url: `https://test-management.browserstack.com/api/v2/projects/${encodeURIComponent(projId)}/folders`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic " +
                        Buffer.from(`${username}:${password}`).toString("base64"),
                },
                body: {
                    folder: {
                        name: folder_name,
                        description: folder_description,
                        parent_id,
                    },
                },
            });
            if (!res.data.success) {
                throw new Error(`Failed to create folder: ${JSON.stringify(res.data)}`);
            }
            // Folder created successfully
            const folder = res.data.folder;
            const projectId = await projectIdentifierToId(projId, config);
            return {
                content: [
                    {
                        type: "text",
                        text: `Folder successfully created:
              - ID: ${folder.id}
              - Name: ${folder.name}
              - Project Identifier: ${projId}
            Access it here: https://test-management.browserstack.com/projects/${projectId}/folder/${folder.id}/`,
                    },
                ],
            };
        }
        catch (err) {
            return formatAxiosError(err, "Failed to create folder.");
        }
    }
    // Only project was created
    return {
        content: [
            { type: "text", text: `Project created with identifier=${projId}` },
        ],
    };
}
