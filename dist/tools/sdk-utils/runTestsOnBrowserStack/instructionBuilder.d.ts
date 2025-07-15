import { RunTestsOnBrowserStackInput } from "./schema.js";
import { BrowserStackConfig } from "../../../lib/types.js";
export interface RunTestsStep {
    type: "setup" | "yml" | "framework" | "percy" | "info" | "error";
    title: string;
    content: string;
    isError?: boolean;
}
export interface RunTestsInstructionResult {
    steps: RunTestsStep[];
    requiresPercy: boolean;
    missingDependencies: string[];
    shouldSkipFormatting?: boolean;
}
/**
 * Main instruction builder with clear execution paths
 * Routes to appropriate handlers based on Percy mode
 */
export declare function buildRunTestsInstructions(input: RunTestsOnBrowserStackInput, config: BrowserStackConfig): RunTestsInstructionResult;
