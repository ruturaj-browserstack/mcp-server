import { z } from "zod";
export const CreateTestCasesFromFileSchema = z.object({
    documentId: z.string().describe("Internal document identifier"),
    folderId: z.string().describe("BrowserStack folder ID"),
    projectReferenceId: z
        .string()
        .describe("The BrowserStack project reference ID is a unique identifier found in the project URL within the BrowserStack Test Management Platform. This ID is also returned by the Upload Document tool."),
});
