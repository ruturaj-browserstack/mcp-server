import {
  RunTestsInstructionResult,
  RunTestsStep,
} from "../instructionBuilder.js";
import { RunTestsOnBrowserStackInput } from "../schema.js";
import { getBrowserStackAuth } from "../../../../lib/get-auth.js";
import { getSDKPrefixCommand } from "../../commands.js";
import {
  generateBrowserStackYMLInstructions,
  getInstructionsForProjectConfiguration,
} from "../../instructions.js";
import { BrowserStackConfig } from "../../../../lib/types.js";
import {
  SDKSupportedBrowserAutomationFramework,
  SDKSupportedTestingFramework,
  SDKSupportedLanguage,
} from "../../types.js";

/**
 * Handler for BrowserStack SDK only (no Percy)
 * Sets up BrowserStack SDK with YML configuration
 */
export function runBstackSDKOnly(
  input: RunTestsOnBrowserStackInput,
  config: BrowserStackConfig,
): RunTestsInstructionResult {
  const steps: RunTestsStep[] = [];
  const authString = getBrowserStackAuth(config);
  const [username, accessKey] = authString.split(":");

  // Handle frameworks with unique setup instructions that don't use browserstack.yml
  if (
    input.detectedBrowserAutomationFramework === "cypress" ||
    input.detectedTestingFramework === "webdriverio"
  ) {
    const frameworkInstructions = getInstructionsForProjectConfiguration(
      input.detectedBrowserAutomationFramework as SDKSupportedBrowserAutomationFramework,
      input.detectedTestingFramework as SDKSupportedTestingFramework,
      input.detectedLanguage as SDKSupportedLanguage,
      username,
      accessKey,
    );

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
  const sdkSetupCommand = getSDKPrefixCommand(
    input.detectedLanguage as SDKSupportedLanguage,
    input.detectedTestingFramework as SDKSupportedTestingFramework,
    username,
    accessKey,
  );

  if (sdkSetupCommand) {
    steps.push({
      type: "setup",
      title: "Install BrowserStack SDK",
      content: sdkSetupCommand,
    });
  }

  const ymlInstructions = generateBrowserStackYMLInstructions(
    input.desiredPlatforms as string[],
    false,
  );

  if (ymlInstructions) {
    steps.push({
      type: "yml",
      title: "Configure browserstack.yml",
      content: ymlInstructions,
    });
  }

  const frameworkInstructions = getInstructionsForProjectConfiguration(
    input.detectedBrowserAutomationFramework as SDKSupportedBrowserAutomationFramework,
    input.detectedTestingFramework as SDKSupportedTestingFramework,
    input.detectedLanguage as SDKSupportedLanguage,
    username,
    accessKey,
  );

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
