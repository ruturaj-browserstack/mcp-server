import { PercyMode } from "./schema.js";
import { runPercyWeb, runBstackSDKOnly, runPercyWithSDK, runPercyAutomateOnly, } from "./handlers/index.js";
/**
 * Main instruction builder with clear execution paths
 * Routes to appropriate handlers based on Percy mode
 */
export function buildRunTestsInstructions(input, config) {
    switch (input.percyMode) {
        case PercyMode.PercyDisabled:
            // BrowserStack SDK only - no Percy
            return runBstackSDKOnly(input, config);
        case PercyMode.PercyWithSDK:
            // BrowserStack SDK + Percy integration with automatic fallback
            return handlePercyWithSDKFlow(input, config);
        case PercyMode.PercyWeb:
            // Percy Web only - no BrowserStack SDK
            return runPercyWeb();
        // No default case needed - TypeScript ensures exhaustive checking
    }
}
/**
 * Handles Percy + SDK flow with automatic fallback logic
 * First tries Percy with SDK, automatically falls back to Percy Automate if unsupported
 * User never directly chooses Percy Automate - it's always a fallback
 */
function handlePercyWithSDKFlow(input, config) {
    // Try Percy with SDK first
    const percyWithSDKResult = runPercyWithSDK(input, config);
    // If Percy with SDK fails (not supported), automatically fallback to Percy Automate
    if (percyWithSDKResult.steps.some((step) => step.isError)) {
        // This is an internal fallback - user never directly requests this
        return runPercyAutomateOnly();
    }
    return percyWithSDKResult;
}
