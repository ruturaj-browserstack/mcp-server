/**
 * Centralized error and fallback messages for runTestsOnBrowserStack tool.
 */
export declare const PERCY_WEB_NOT_IMPLEMENTED = "Percy Web (direct Percy SDK) support is not yet implemented. Please check back later.";
export declare const PERCY_AUTOMATE_NOT_IMPLEMENTED = "[Percy Automate support is not yet implemented for this configuration. Please check back later.]";
export declare const BOOTSTRAP_FAILED: (error: unknown, context: {
    config: unknown;
    percyMode?: string;
    sdkVersion?: string;
}) => string;
