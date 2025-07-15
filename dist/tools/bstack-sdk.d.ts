import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { SDKSupportedBrowserAutomationFramework, SDKSupportedLanguage, SDKSupportedTestingFramework } from "./sdk-utils/types.js";
import { BrowserStackConfig } from "../lib/types.js";
/**
 * BrowserStack SDK hooks into your test framework to seamlessly run tests on BrowserStack.
 * This tool gives instructions to setup a browserstack.yml file in the project root and installs the necessary dependencies.
 */
export declare function bootstrapProjectWithSDK({ detectedBrowserAutomationFramework, detectedTestingFramework, detectedLanguage, desiredPlatforms, enablePercy, config, }: {
    detectedBrowserAutomationFramework: SDKSupportedBrowserAutomationFramework;
    detectedTestingFramework: SDKSupportedTestingFramework;
    detectedLanguage: SDKSupportedLanguage;
    desiredPlatforms: string[];
    enablePercy: boolean;
    config: BrowserStackConfig;
}): Promise<CallToolResult>;
export default function addSDKTools(server: McpServer, config: BrowserStackConfig): Record<string, any>;
