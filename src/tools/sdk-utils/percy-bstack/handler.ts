// Percy + BrowserStack SDK combined handler
import { RunTestsInstructionResult, RunTestsStep } from "../common/types.js";
import { RunTestsOnBrowserStackInput } from "../common/schema.js";
import { getBrowserStackAuth } from "../../../lib/get-auth.js";
import { getSDKPrefixCommand } from "../bstack/commands.js";
import { generateBrowserStackYMLInstructions } from "../bstack/configUtils.js";
import { getInstructionsForProjectConfiguration } from "../common/instructionUtils.js";
import {
  formatPercyInstructions,
  getPercyInstructions,
} from "./instructions.js";
import { BrowserStackConfig } from "../../../lib/types.js";
import {
  SDKSupportedBrowserAutomationFramework,
  SDKSupportedTestingFramework,
  SDKSupportedLanguage,
} from "../common/types.js";

export function runPercyWithSDK(
  input: RunTestsOnBrowserStackInput,
  config: BrowserStackConfig,
): RunTestsInstructionResult {
  const steps: RunTestsStep[] = [];
  const authString = getBrowserStackAuth(config);
  const [username, accessKey] = authString.split(":");

  // Check if Percy is supported for this configuration
  const percyResult = getPercyInstructions(
    input.detectedLanguage as SDKSupportedLanguage,
    input.detectedBrowserAutomationFramework as SDKSupportedBrowserAutomationFramework,
    input.detectedTestingFramework as SDKSupportedTestingFramework,
  );

  if (!percyResult) {
    // Percy not supported for this configuration
    return {
      steps: [
        {
          type: "error",
          title: "Percy Not Supported",
          content:
            "Percy is not supported for this framework configuration. Please use BrowserStack SDK only mode or try a different framework combination.",
          isError: true,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
    };
  }

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
      type: "instruction",
      title: "Framework-Specific Setup",
      content: frameworkInstructions,
    });

    steps.push({
      type: "instruction",
      title: "Percy Setup (BrowserStack SDK + Percy)",
      content: formatPercyInstructions(percyResult),
    });

    return {
      steps,
      requiresPercy: true,
      missingDependencies: [],
    };
  }

  // Default flow using browserstack.yml with Percy
  const sdkSetupCommand = getSDKPrefixCommand(
    input.detectedLanguage as SDKSupportedLanguage,
    input.detectedTestingFramework as SDKSupportedTestingFramework,
    username,
    accessKey,
  );

  if (sdkSetupCommand) {
    steps.push({
      type: "instruction",
      title: "Install BrowserStack SDK",
      content: sdkSetupCommand,
    });
  }

  const ymlInstructions = generateBrowserStackYMLInstructions(
    input.desiredPlatforms as string[],
    true,
  );

  if (ymlInstructions) {
    steps.push({
      type: "instruction",
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
      type: "instruction",
      title: "Framework-Specific Setup",
      content: frameworkInstructions,
    });
  }

  steps.push({
    type: "instruction",
    title: "Percy Setup (BrowserStack SDK + Percy)",
    content: formatPercyInstructions(percyResult),
  });

  return {
    steps,
    requiresPercy: true,
    missingDependencies: [],
  };
}
