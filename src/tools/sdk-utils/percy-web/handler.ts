// Handler for Percy Web only mode - Visual testing without BrowserStack infrastructure
import { RunTestsInstructionResult, RunTestsStep } from "../common/types.js";
import { RunTestsOnBrowserStackInput } from "../common/schema.js";
import { SUPPORTED_CONFIGURATIONS } from "./frameworks.js";
import {
  SDKSupportedBrowserAutomationFramework,
  SDKSupportedTestingFramework,
  SDKSupportedLanguage,
} from "../common/types.js";

export function runPercyWeb(
  input: RunTestsOnBrowserStackInput,
  percyToken: string,
): RunTestsInstructionResult {
  const steps: RunTestsStep[] = [];

  // Check if this configuration is supported for Percy Web
  const languageConfig = SUPPORTED_CONFIGURATIONS[input.detectedLanguage as SDKSupportedLanguage];
  
  if (!languageConfig) {
    return {
      steps: [
        {
          type: "error",
          title: "Language Not Supported",
          content: `Percy Web does not support the language: ${input.detectedLanguage}. Supported languages are: ${Object.keys(SUPPORTED_CONFIGURATIONS).join(", ")}.`,
          isError: true,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
    };
  }

  const frameworkConfig = languageConfig[input.detectedBrowserAutomationFramework as SDKSupportedBrowserAutomationFramework];
  
  if (!frameworkConfig) {
    return {
      steps: [
        {
          type: "error",
          title: "Framework Not Supported",
          content: `Percy Web does not support ${input.detectedBrowserAutomationFramework} for ${input.detectedLanguage}. Supported frameworks for ${input.detectedLanguage} are: ${Object.keys(languageConfig).join(", ")}.`,
          isError: true,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
    };
  }

  const testingFrameworkConfig = frameworkConfig[input.detectedTestingFramework as SDKSupportedTestingFramework];
  
  if (!testingFrameworkConfig) {
    return {
      steps: [
        {
          type: "error",
          title: "Testing Framework Not Supported",
          content: `Percy Web does not support ${input.detectedTestingFramework} with ${input.detectedBrowserAutomationFramework} for ${input.detectedLanguage}. Supported testing frameworks for this combination are: ${Object.keys(frameworkConfig).join(", ")}.`,
          isError: true,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
    };
  }

  // Generate instructions for the supported configuration
  const instructions = testingFrameworkConfig.instructions(percyToken);

  // Prepend a step to set the Percy token in the environment
  steps.push({
    type: "instruction",
    title: "Set Percy Token in Environment",
    content: `Copy the Percy token generated for your project and set it as an environment variable before running your tests:\n\nexport PERCY_TOKEN="${percyToken}"\n\n(For Windows, use 'setx PERCY_TOKEN "${percyToken}"' or 'set PERCY_TOKEN=${percyToken}' as appropriate.)`,
  });

  steps.push({
    type: "instruction",
    title: `Percy Web Setup for ${input.detectedLanguage} with ${input.detectedBrowserAutomationFramework}/${input.detectedTestingFramework}`,
    content: instructions,
  });

  return {
    steps,
    requiresPercy: true,
    missingDependencies: [],
  };
}
