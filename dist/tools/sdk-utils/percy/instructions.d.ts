import { SDKSupportedBrowserAutomationFramework, SDKSupportedLanguage, SDKSupportedTestingFramework } from "../types.js";
import { PercyInstructions } from "./types.js";
/**
 * Retrieves Percy-specific instructions for a given language and framework.
 */
export declare function getPercyInstructions(language: SDKSupportedLanguage, automationFramework: SDKSupportedBrowserAutomationFramework, testingFramework: SDKSupportedTestingFramework): PercyInstructions | null;
/**
 * Formats the retrieved Percy instructions into a user-friendly string.
 */
export declare function formatPercyInstructions(instructions: PercyInstructions): string;
