import { RunTestsInstructionResult } from "../instructionBuilder.js";
/**
 * Handler for Percy Automate only (fallback when Percy SDK not supported)
 * Currently not implemented - returns error step with minimal formatting
 */
export declare function runPercyAutomateOnly(): RunTestsInstructionResult;
