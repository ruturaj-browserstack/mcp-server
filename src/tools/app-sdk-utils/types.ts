export enum AppSDKSupportedLanguageEnum {
  java = "java",
  nodejs = "nodejs",
  python = "python",
  ruby = "ruby",
}
export type AppSDKSupportedLanguage = keyof typeof AppSDKSupportedLanguageEnum;

export enum AppSDKSupportedFrameworkEnum {
  appium = "appium",
  webdriverio = "webdriverio",
  nightwatch = "nightwatch",
  jest = "jest",
  mocha = "mocha",
  "cucumber-js" = "cucumber-js",
  pytest = "pytest",
  rspec = "rspec",
  "cucumber-ruby" = "cucumber-ruby",
}

export type AppSDKSupportedFramework =
  keyof typeof AppSDKSupportedFrameworkEnum;

export enum AppSDKSupportedTestingFrameworkEnum {
  testng = "testng",
  "cucumber-testng" = "cucumber-testng",
  "cucumber-junit4" = "cucumber-junit4",
  "cucumber-junit5" = "cucumber-junit5",
  webdriverio = "webdriverio",
  nightwatch = "nightwatch",
  jest = "jest",
  mocha = "mocha",
  "cucumber-js" = "cucumber-js",
  robot = "robot",
  pytest = "pytest",
  behave = "behave",
  lettuce = "lettuce",
  rspec = "rspec",
  "cucumber-ruby" = "cucumber-ruby",
}

export type AppSDKSupportedTestingFramework =
  keyof typeof AppSDKSupportedTestingFrameworkEnum;

export enum AppSDKSupportedPlatformEnum {
  android = "android",
  ios = "ios",
}
export type AppSDKSupportedPlatform = keyof typeof AppSDKSupportedPlatformEnum;

export type AppConfigMapping = Record<
  AppSDKSupportedLanguageEnum,
  Partial<
    Record<
      AppSDKSupportedFrameworkEnum,
      Partial<
        Record<
          AppSDKSupportedTestingFrameworkEnum,
          { instructions: (username: string, accessKey: string) => string }
        >
      >
    >
  >
>;
