import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Schema for creating LCA steps for a test case
 */
export declare const CreateLCAStepsSchema: z.ZodObject<{
    project_identifier: z.ZodString;
    test_case_identifier: z.ZodString;
    base_url: z.ZodString;
    credentials: z.ZodOptional<z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        password: string;
    }, {
        username: string;
        password: string;
    }>>;
    local_enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    test_name: z.ZodString;
    test_case_details: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        preconditions: z.ZodString;
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
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        test_case_steps: {
            step: string;
            result: string;
        }[];
        preconditions: string;
    }, {
        name: string;
        description: string;
        test_case_steps: {
            step: string;
            result: string;
        }[];
        preconditions: string;
    }>;
    wait_for_completion: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    project_identifier: string;
    test_case_identifier: string;
    base_url: string;
    local_enabled: boolean;
    test_name: string;
    test_case_details: {
        name: string;
        description: string;
        test_case_steps: {
            step: string;
            result: string;
        }[];
        preconditions: string;
    };
    wait_for_completion: boolean;
    credentials?: {
        username: string;
        password: string;
    } | undefined;
}, {
    project_identifier: string;
    test_case_identifier: string;
    base_url: string;
    test_name: string;
    test_case_details: {
        name: string;
        description: string;
        test_case_steps: {
            step: string;
            result: string;
        }[];
        preconditions: string;
    };
    credentials?: {
        username: string;
        password: string;
    } | undefined;
    local_enabled?: boolean | undefined;
    wait_for_completion?: boolean | undefined;
}>;
export type CreateLCAStepsArgs = z.infer<typeof CreateLCAStepsSchema>;
/**
 * Creates LCA (Low Code Automation) steps for a test case in BrowserStack Test Management
 */
export declare function createLCASteps(args: CreateLCAStepsArgs, context: any, config: BrowserStackConfig): Promise<CallToolResult>;
