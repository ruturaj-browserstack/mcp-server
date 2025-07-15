import { getBrowserStackAuth } from "../../../../lib/get-auth.js";
import { getSDKPrefixCommand } from "../../commands.js";
import { generateBrowserStackYMLInstructions, getInstructionsForProjectConfiguration, } from "../../instructions.js";
/**
 * Handler for BrowserStack SDK only (no Percy)
 * Sets up BrowserStack SDK with YML configuration
 */
export function runBstackSDKOnly(input, config) {
    const steps = [];
    const authString = getBrowserStackAuth(config);
    const [username, accessKey] = authString.split(":");
    // Handle frameworks with unique setup instructions that don't use browserstack.yml
    if (input.detectedBrowserAutomationFramework === "cypress" ||
        input.detectedTestingFramework === "webdriverio") {
        const frameworkInstructions = getInstructionsForProjectConfiguration(input.detectedBrowserAutomationFramework, input.detectedTestingFramework, input.detectedLanguage, username, accessKey);
        steps.push({
            type: "framework",
            title: "Framework-Specific Setup",
            content: frameworkInstructions,
        });
        return {
            steps,
            requiresPercy: false,
            missingDependencies: [],
        };
    }
    // Default flow using browserstack.yml
    const sdkSetupCommand = getSDKPrefixCommand(input.detectedLanguage, input.detectedTestingFramework, username, accessKey);
    if (sdkSetupCommand) {
        steps.push({
            type: "setup",
            title: "Install BrowserStack SDK",
            content: sdkSetupCommand,
        });
    }
    const ymlInstructions = generateBrowserStackYMLInstructions(input.desiredPlatforms, false);
    if (ymlInstructions) {
        steps.push({
            type: "yml",
            title: "Configure browserstack.yml",
            content: ymlInstructions,
        });
    }
    const frameworkInstructions = getInstructionsForProjectConfiguration(input.detectedBrowserAutomationFramework, input.detectedTestingFramework, input.detectedLanguage, username, accessKey);
    if (frameworkInstructions) {
        steps.push({
            type: "framework",
            title: "Framework-Specific Setup",
            content: frameworkInstructions,
        });
    }
    return {
        steps,
        requiresPercy: false,
        missingDependencies: [],
    };
}
