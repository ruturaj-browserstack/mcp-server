import { z } from "zod";
import {
  SDKSupportedBrowserAutomationFrameworkEnum,
  SDKSupportedTestingFrameworkEnum,
  SDKSupportedLanguageEnum,
} from "../types.js";

export enum PercyMode {
  PercyDisabled = "percy-disabled", // BrowserStack SDK only, no Percy
  PercyWithSDK = "percy-with-sdk", // BrowserStack SDK + Percy integration (with fallback)
  PercyWeb = "percy-web", // Percy Web only (not implemented)
}

// Internal enum for execution paths (includes fallback)
export enum InternalPercyMode {
  PercyDisabled = "percy-disabled",
  PercyWithSDK = "percy-with-sdk",
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
    "Percy integration mode: 'percy-disabled' (SDK only), 'percy-with-sdk' (SDK + Percy with automatic fallback), or 'percy-web' (Percy Web only)",
  ),
};

export const RunTestsOnBrowserStackSchema = z.object(
  RunTestsOnBrowserStackParamsShape,
);

export type RunTestsOnBrowserStackInput = z.infer<
  typeof RunTestsOnBrowserStackSchema
>;
