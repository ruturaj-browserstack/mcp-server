import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
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
export declare const CreateTestCaseSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    folder_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    preconditions: z.ZodOptional<z.ZodString>;
    test_case_steps: z.ZodArray<z.ZodObject<{
        step: z.ZodString;
        result: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        step: string;
        result: string;
    }, {
        step: string;
        result: string;
    }>, "many">;
    issues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    issue_tracker: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        host: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        host: string;
    }, {
        name: string;
        host: string;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    custom_fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    test_case_steps: {
        step: string;
        result: string;
    }[];
    project_identifier: string;
    folder_id: string;
    issues?: string[] | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    custom_fields?: Record<string, string> | undefined;
    preconditions?: string | undefined;
    owner?: string | undefined;
    issue_tracker?: {
        name: string;
        host: string;
    } | undefined;
}, {
    name: string;
    test_case_steps: {
        step: string;
        result: string;
    }[];
    project_identifier: string;
    folder_id: string;
    issues?: string[] | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    custom_fields?: Record<string, string> | undefined;
    preconditions?: string | undefined;
    owner?: string | undefined;
    issue_tracker?: {
        name: string;
        host: string;
    } | undefined;
}>;
export declare function sanitizeArgs(args: any): any;
export declare function createTestCase(params: TestCaseCreateRequest, config: BrowserStackConfig): Promise<CallToolResult>;
export {};
