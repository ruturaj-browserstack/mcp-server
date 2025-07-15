import { z } from "zod";
import { SDKSupportedBrowserAutomationFrameworkEnum, SDKSupportedTestingFrameworkEnum, SDKSupportedLanguageEnum } from "../types.js";
export declare enum PercyMode {
    PercyDisabled = "percy-disabled",// BrowserStack SDK only, no Percy
    PercyWithSDK = "percy-on-browserstack-infra",// BrowserStack SDK + Percy integration (with fallback)
    PercyWeb = "percy-on-local-infra"
}
export declare enum InternalPercyMode {
    PercyDisabled = "percy-disabled",
    PercyWithSDK = "percy-on-browserstack-infra",
    PercyAutomate = "percy-automate",
    PercyWeb = "percy-on-local-infra"
}
export declare const PercyModeEnum: z.ZodNativeEnum<typeof PercyMode>;
export declare const RunTestsOnBrowserStackParamsShape: {
    detectedBrowserAutomationFramework: z.ZodNativeEnum<typeof SDKSupportedBrowserAutomationFrameworkEnum>;
    detectedTestingFramework: z.ZodNativeEnum<typeof SDKSupportedTestingFrameworkEnum>;
    detectedLanguage: z.ZodNativeEnum<typeof SDKSupportedLanguageEnum>;
    desiredPlatforms: z.ZodArray<z.ZodEnum<["windows", "macos", "android", "ios"]>, "many">;
    percyMode: z.ZodDefault<z.ZodNativeEnum<typeof PercyMode>>;
};
export declare const RunTestsOnBrowserStackSchema: z.ZodObject<{
    detectedBrowserAutomationFramework: z.ZodNativeEnum<typeof SDKSupportedBrowserAutomationFrameworkEnum>;
    detectedTestingFramework: z.ZodNativeEnum<typeof SDKSupportedTestingFrameworkEnum>;
    detectedLanguage: z.ZodNativeEnum<typeof SDKSupportedLanguageEnum>;
    desiredPlatforms: z.ZodArray<z.ZodEnum<["windows", "macos", "android", "ios"]>, "many">;
    percyMode: z.ZodDefault<z.ZodNativeEnum<typeof PercyMode>>;
}, "strip", z.ZodTypeAny, {
    detectedBrowserAutomationFramework: SDKSupportedBrowserAutomationFrameworkEnum;
    detectedTestingFramework: SDKSupportedTestingFrameworkEnum;
    detectedLanguage: SDKSupportedLanguageEnum;
    desiredPlatforms: ("android" | "windows" | "macos" | "ios")[];
    percyMode: PercyMode;
}, {
    detectedBrowserAutomationFramework: SDKSupportedBrowserAutomationFrameworkEnum;
    detectedTestingFramework: SDKSupportedTestingFrameworkEnum;
    detectedLanguage: SDKSupportedLanguageEnum;
    desiredPlatforms: ("android" | "windows" | "macos" | "ios")[];
    percyMode?: PercyMode | undefined;
}>;
export type RunTestsOnBrowserStackInput = z.infer<typeof RunTestsOnBrowserStackSchema>;
