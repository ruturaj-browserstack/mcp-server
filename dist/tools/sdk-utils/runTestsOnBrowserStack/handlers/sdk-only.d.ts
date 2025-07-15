import { RunTestsInstructionResult } from "../instructionBuilder.js";
import { RunTestsOnBrowserStackInput } from "../schema.js";
import { BrowserStackConfig } from "../../../../lib/types.js";
/**
 * Handler for BrowserStack SDK only (no Percy)
 * Sets up BrowserStack SDK with YML configuration
 */
export declare function runBstackSDKOnly(input: RunTestsOnBrowserStackInput, config: BrowserStackConfig): RunTestsInstructionResult;
