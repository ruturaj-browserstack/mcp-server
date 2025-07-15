import { z } from "zod";
import { SDKSupportedBrowserAutomationFrameworkEnum, SDKSupportedTestingFrameworkEnum, SDKSupportedLanguageEnum, } from "../types.js";
export var PercyMode;
(function (PercyMode) {
    PercyMode["PercyDisabled"] = "percy-disabled";
    PercyMode["PercyWithSDK"] = "percy-on-browserstack-infra";
    PercyMode["PercyWeb"] = "percy-on-local-infra";
})(PercyMode || (PercyMode = {}));
// Internal enum for execution paths (includes fallback)
export var InternalPercyMode;
(function (InternalPercyMode) {
    InternalPercyMode["PercyDisabled"] = "percy-disabled";
    InternalPercyMode["PercyWithSDK"] = "percy-on-browserstack-infra";
    InternalPercyMode["PercyAutomate"] = "percy-automate";
    InternalPercyMode["PercyWeb"] = "percy-on-local-infra";
})(InternalPercyMode || (InternalPercyMode = {}));
// Centralized enum for Percy (Zod) - Only user-facing options
export const PercyModeEnum = z.nativeEnum(PercyMode);
// User-facing schema - only 3 options for user
export const RunTestsOnBrowserStackParamsShape = {
    detectedBrowserAutomationFramework: z.nativeEnum(SDKSupportedBrowserAutomationFrameworkEnum),
    detectedTestingFramework: z.nativeEnum(SDKSupportedTestingFrameworkEnum),
    detectedLanguage: z.nativeEnum(SDKSupportedLanguageEnum),
    desiredPlatforms: z.array(z.enum(["windows", "macos", "android", "ios"])),
    percyMode: PercyModeEnum.default(PercyMode.PercyDisabled).describe("modes to run tests on percy. Ask user to choose one of the following: 'percy-on-browserstack-infra', 'percy-web' if your unsure when percy should be enabled."),
};
export const RunTestsOnBrowserStackSchema = z.object(RunTestsOnBrowserStackParamsShape);
