/**
 * Centralized error and fallback messages for runTestsOnBrowserStack tool.
 */
export const PERCY_WEB_NOT_IMPLEMENTED = "Percy Web (direct Percy SDK) support is not yet implemented. Please check back later.";
export const PERCY_AUTOMATE_NOT_IMPLEMENTED = "[Percy Automate support is not yet implemented for this configuration. Please check back later.]";
export const BOOTSTRAP_FAILED = (error, context) => `Failed to bootstrap project with BrowserStack SDK.
Error: ${error}
Config: ${JSON.stringify(context.config, null, 2)}
Percy Mode: ${context.percyMode ?? "automate"}
SDK Version: ${context.sdkVersion ?? "N/A"}
Please open an issue on GitHub if the problem persists.`;
