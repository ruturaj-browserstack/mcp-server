import { z } from "zod";
export declare const CreateTestCasesFromFileSchema: z.ZodObject<{
    documentId: z.ZodString;
    folderId: z.ZodString;
    projectReferenceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    folderId: string;
    projectReferenceId: string;
}, {
    documentId: string;
    folderId: string;
    projectReferenceId: string;
}>;
export type CreateTestCasesFromFileArgs = z.infer<typeof CreateTestCasesFromFileSchema>;
export interface DefaultFieldMaps {
    priority: Record<string, number>;
    status: Record<string, number>;
    caseType: Record<string, number>;
}
export interface Scenario {
    id: string;
    name: string;
    testcases: any[];
    traceId?: string;
}
