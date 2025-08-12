import {
  AppSDKSupportedLanguage,
  AppSDKSupportedFramework,
  AppSDKSupportedTestingFramework,
} from "./types.js";
import { AppSDKSupportedLanguageEnum, AppSDKSupportedTestingFrameworkEnum } from "./types.js";

// App Automate specific device configurations
const APP_DEVICE_CONFIGS = {
  android: [
    { deviceName: "Samsung Galaxy S22 Ultra", platformVersion: "12.0" },
    { deviceName: "Google Pixel 7 Pro", platformVersion: "13.0" },
    { deviceName: "OnePlus 9", platformVersion: "11.0" },
  ],
  ios: [
    { deviceName: "iPhone 14", platformVersion: "16" },
    { deviceName: "iPhone 13", platformVersion: "15" },
    { deviceName: "iPad Air 4", platformVersion: "14" },
  ],
};

export function generateAppBrowserStackYMLInstructions(
  platforms: string[],
  username: string,
  accessKey: string,
  appPath: string = "bs://sample.app",
): string {
  const platformConfigs = platforms
    .map((platform) => {
      const devices =
        APP_DEVICE_CONFIGS[platform as keyof typeof APP_DEVICE_CONFIGS];
      if (!devices) return "";

      return devices
        .map(
          (device) => `  - platformName: ${platform}
          deviceName: ${device.deviceName}
          platformVersion: "${device.platformVersion}"`,
        )
        .join("\n");
    })
    .filter(Boolean)
    .join("\n");

  return `---STEP---
Update browserstack.yml file with App Automate configuration:

Create or update the browserstack.yml file in your project root with the following content:

\`\`\`yaml
userName: ${username}
accessKey: ${accessKey}
framework: testng
app: ${appPath}
platforms:
${platformConfigs}
parallelsPerPlatform: 1
browserstackLocal: true
buildName: bstack-demo
projectName: BrowserStack Sample
debug: true
networkLogs: true
percy: false
percyCaptureMode: auto
accessibility: false
\`\`\`

**Important notes:**
- Replace \`app: ${appPath}\` with the path to your actual app file (e.g., \`./SampleApp.apk\` for Android or \`./SampleApp.ipa\` for iOS)
- You can upload your app using BrowserStack's App Upload API or manually through the dashboard
- Set \`browserstackLocal: true\` if you need to test with local/staging servers
- Adjust \`parallelsPerPlatform\` based on your subscription limits`;
}

export function getAppInstructionsForProjectConfiguration(
  framework: AppSDKSupportedFramework,
  testingFramework: AppSDKSupportedTestingFramework,
  language: AppSDKSupportedLanguage,
): string {
  if (!framework || !testingFramework || !language) {
    return "";
  }
  switch (language) {
    case AppSDKSupportedLanguageEnum.java:
      return getJavaAppInstructions(testingFramework);
    case AppSDKSupportedLanguageEnum.nodejs:
      return getNodejsAppInstructions(testingFramework);
    default:
      return "";
  }
}

function getJavaAppInstructions(
  testingFramework: AppSDKSupportedTestingFramework,
): string {
  if (testingFramework === AppSDKSupportedTestingFrameworkEnum.testng) {
    return `---STEP---
    Run your App Automate test suite:

    \`\`\`bash
    mvn test
    \`\`\``;
  }
  return "";
}

function getNodejsAppInstructions(
  testingFramework: AppSDKSupportedTestingFramework,
): string {
  if (testingFramework === AppSDKSupportedTestingFrameworkEnum.webdriverio) {
    return `---STEP---
    Run your App Automate test suite:

    \`\`\`bash
    npx wdio run ./wdio.conf.js
    \`\`\``;
  }
  else if (testingFramework === AppSDKSupportedTestingFrameworkEnum.nightwatch) {
    return `---STEP---
    Run your App Automate test suite:
    For Android:
    \`\`\`bash
      npx nightwatch <path to tests> --env browserstack.android
    \`\`\`
    For iOS:
    \`\`\`bash
      npx nightwatch <path to tests> --env browserstack.ios
    \`\`\``;
  }
  return "";
}

// Utility function to format instructions with step numbers
export function formatAppInstructionsWithNumbers(instructions: string): string {
  const steps = instructions.split("---STEP---").filter((step) => step.trim());

  return steps
    .map((step, index) => `**Step ${index + 1}:**\n${step.trim()}`)
    .join("\n\n");
}
