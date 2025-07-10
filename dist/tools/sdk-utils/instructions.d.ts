import { SDKSupportedLanguage } from "./types.js";
import { SDKSupportedBrowserAutomationFramework } from "./types.js";
import { SDKSupportedTestingFramework } from "./types.js";
export declare const getInstructionsForProjectConfiguration: (detectedBrowserAutomationFramework: SDKSupportedBrowserAutomationFramework, detectedTestingFramework: SDKSupportedTestingFramework, detectedLanguage: SDKSupportedLanguage, username: string, accessKey: string) => string;
export declare function generateBrowserStackYMLInstructions(desiredPlatforms: string[], enablePercy?: boolean): string;
export declare function formatInstructionsWithNumbers(instructionText: string, separator?: string): string;
