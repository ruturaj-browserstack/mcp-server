import { z } from "zod";
import {
  SDKSupportedBrowserAutomationFrameworkEnum,
  SDKSupportedTestingFrameworkEnum,
  SDKSupportedLanguageEnum,
} from "../types.js";

export enum PercyMode {
  PercyDisabled = "percy-disabled", // BrowserStack SDK only, no Percy
  PercyWithSDK = "percy-on-browserstack-infra", // BrowserStack SDK + Percy integration (with fallback)
  PercyWeb = "percy-web", // Percy Web only (not implemented)
}

// Internal enum for execution paths (includes fallback)
export enum InternalPercyMode {
  PercyDisabled = "percy-disabled",
  PercyWithSDK = "percy-on-browserstack-infra",
  PercyAutomate = "percy-automate", // Internal fallback only
  PercyWeb = "percy-web",
}

// Centralized enum for Percy (Zod) - Only user-facing options
export const PercyModeEnum = z.nativeEnum(PercyMode);

// User-facing schema - only 3 options for user
export const RunTestsOnBrowserStackParamsShape = {
  detectedBrowserAutomationFramework: z.nativeEnum(
    SDKSupportedBrowserAutomationFrameworkEnum,
  ),
  detectedTestingFramework: z.nativeEnum(SDKSupportedTestingFrameworkEnum),
  detectedLanguage: z.nativeEnum(SDKSupportedLanguageEnum),
  desiredPlatforms: z.array(z.enum(["windows", "macos", "android", "ios"])),
  percyMode: PercyModeEnum.default(PercyMode.PercyDisabled).describe(
  ),
};

export const RunTestsOnBrowserStackSchema = z.object(
  RunTestsOnBrowserStackParamsShape,
);

export type RunTestsOnBrowserStackInput = z.infer<
  typeof RunTestsOnBrowserStackSchema
>;
