import { RunTestsInstructionResult } from "../instructionBuilder.js";
import { RunTestsOnBrowserStackInput } from "../schema.js";
import { BrowserStackConfig } from "../../../../lib/types.js";
/**
 * Handler for BrowserStack SDK with Percy integration
 * Sets up both BrowserStack SDK and Percy visual testing
 */
export declare function runPercyWithSDK(input: RunTestsOnBrowserStackInput, config: BrowserStackConfig): RunTestsInstructionResult;
