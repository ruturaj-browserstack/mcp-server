import { RunTestsOnBrowserStackInput, PercyMode } from "./schema.js";
import { BrowserStackConfig } from "../../../lib/types.js";
import { runPercyWeb } from "../percy-web/handler.js";
import { runBstackSDKOnly } from "../bstack/sdkHandler.js";
import { runPercyWithSDK } from "../percy-bstack/handler.js";
import { runPercyAutomateOnly } from "../percy-automate/handler.js";
import { fetchPercyToken } from "../percy-web/fetchPercyToken.js";
import { getBrowserStackAuth } from "../../../lib/get-auth.js";
import { RunTestsInstructionResult } from "./types.js";

/**
 * Main instruction builder with clear execution paths
 * Routes to appropriate handlers based on Percy mode
 */
export async function buildRunTestsInstructions(
  input: RunTestsOnBrowserStackInput,
  config: BrowserStackConfig,
  projectName: string // New parameter for project name
): Promise<RunTestsInstructionResult> {
  switch (input.percyMode) {
    case PercyMode.PercyDisabled:
      // BrowserStack SDK only - no Percy
      return runBstackSDKOnly(input, config);

    case PercyMode.PercyWithSDK:
      // BrowserStack SDK + Percy integration with automatic fallback
      return handlePercyWithSDKFlow(input, config);

    case PercyMode.PercyWeb: {
      // Percy Web only - no BrowserStack SDK
      // Fetch Percy token from API
      const authorization = getBrowserStackAuth(config);
      // TODO: Pass the correct PERCY_INSTRUCTIONS map here
      // For now, pass an empty object as a placeholder
      const percyToken = await fetchPercyToken(
        projectName,
        authorization
      );
      return runPercyWeb(input, percyToken || "YOUR_PERCY_TOKEN_HERE");
    }

    default:
      // This should never happen due to schema validation, but TypeScript requires exhaustive handling
      throw new Error(`Unsupported percy mode: ${input.percyMode}`);
  }
}

/**
 * Handles Percy + SDK flow with automatic fallback logic
 * First tries Percy with SDK, automatically falls back to Percy Automate if unsupported
 * User never directly chooses Percy Automate - it's always a fallback
 */
function handlePercyWithSDKFlow(
  input: RunTestsOnBrowserStackInput,
  config: BrowserStackConfig,
): RunTestsInstructionResult {
  // Try Percy with SDK first
  const percyWithSDKResult = runPercyWithSDK(input, config);

  // If Percy with SDK fails (not supported), automatically fallback to Percy Automate
  if (percyWithSDKResult.steps.some((step) => step.isError)) {
    // This is an internal fallback - user never directly requests this
    return runPercyAutomateOnly();
  }

  return percyWithSDKResult;
}
