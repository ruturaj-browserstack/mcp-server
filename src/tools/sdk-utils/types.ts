export type SDKSupportedLanguage = "nodejs" | "python" | "java";
export type SDKSupportedBrowserAutomationFramework = "playwright" | "selenium";
export type SDKSupportedTestingFramework =
  | "jest"
  | "codeceptjs"
  | "playwright"
  | "pytest"
  | "robot"
  | "behave"
  | "cucumber"
  | "nightwatch"
  | "webdriverio"
  | "mocha"
  | "junit"
  | "testng";

export type ConfigMapping = Record<
  SDKSupportedLanguage,
  Record<
    SDKSupportedBrowserAutomationFramework,
    Partial<Record<SDKSupportedTestingFramework, { instructions: string }>>
  >
>;
