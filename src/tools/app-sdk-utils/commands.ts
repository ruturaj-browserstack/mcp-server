// Utility to get the language-dependent prefix command for BrowserStack App Automate SDK setup
import { AppSDKSupportedLanguage } from "./types.js";
import {
  GRADLE_APP_SETUP_INSTRUCTIONS,
  getMavenAppAutomateCommand,
} from "./constants.js";
import { getSetBrowserStackCredentialsStep } from "./utils.js";
import {
  AppSDKSupportedLanguageEnum,
  AppSDKSupportedFrameworkEnum,
} from "./types.js";

// Framework mapping for Java Maven archetype generation for App Automate
const JAVA_APP_FRAMEWORK_MAP: Record<string, string> = {
  "testng": "browserstack-sdk-archetype-integrate",
  "cucumber-testng": "browserstack-sdk-archetype-integrate",
  "cucumber-junit4": "browserstack-sdk-archetype-integrate",
  "cucumber-junit5": "browserstack-sdk-archetype-integrate",
};

export function getJavaAppFrameworkForMaven(framework: string): string {
  return JAVA_APP_FRAMEWORK_MAP[framework] || framework;
}

export function getAppSDKPrefixCommand(
  language: AppSDKSupportedLanguage,
  framework: string,
  username: string,
  accessKey: string
): string {
  switch (language) {
    case AppSDKSupportedLanguageEnum.java: {
      const mavenFramework = getJavaAppFrameworkForMaven(framework);
      const mavenCommand = getMavenAppAutomateCommand(
        mavenFramework,
        framework,
        username,
        accessKey
      );

      return (
        getSetBrowserStackCredentialsStep(username, accessKey) +
        `---STEP---
        Install BrowserStack SDK using Maven Archetype for App Automate

        Maven command for ${framework} (${
                  process.platform === "win32" ? "Windows" : "macOS/Linux"
                }):
        \`\`\`bash
        ${mavenCommand}
        \`\`\`

        Alternative setup for Gradle users:
        ${GRADLE_APP_SETUP_INSTRUCTIONS}`
      );
    }

    case AppSDKSupportedLanguageEnum.nodejs: {
      if (framework === AppSDKSupportedFrameworkEnum.webdriverio) {
        return (
          getSetBrowserStackCredentialsStep(username, accessKey) +
          `---STEP---
          Install BrowserStack WDIO service:

          \`\`\`bash
          npm install @wdio/browserstack-service --save-dev
          \`\`\`

          ---STEP---
          Update your WebdriverIO config file (e.g., \`wdio.conf.js\`) to add the BrowserStack service and capabilities:

          \`\`\`js
          exports.config = {
            user: process.env.BROWSERSTACK_USERNAME || '${username}',
            key: process.env.BROWSERSTACK_ACCESS_KEY || '${accessKey}',
            hostname: 'hub.browserstack.com',
            services: [
              [
                'browserstack',
                {
                  app: 'bs://sample.app',
                  browserstackLocal: true,
                  accessibility: false,
                  testObservabilityOptions: {
                    buildName: "bstack-demo",
                    projectName: "BrowserStack Sample",
                    buildTag: 'Any build tag goes here. For e.g. ["Tag1","Tag2"]'
                  },
                },
              ]
            ],
            capabilities: [{
              'bstack:options': {
                deviceName: 'Samsung Galaxy S22 Ultra',
                platformVersion: '12.0',
                platformName: 'android',
              }
            }],
            commonCapabilities: {
              'bstack:options': {
                debug: true,
                networkLogs: true,
                percy: false,
                percyCaptureMode: 'auto'
              }
            },
            maxInstances: 10,
            // ...other config
          };`
        );
      }
      if (framework === AppSDKSupportedFrameworkEnum.nightwatch) {
        return (
          getSetBrowserStackCredentialsStep(username, accessKey) +
          `---STEP---
          Install Nightwatch and BrowserStack integration:

          \`\`\`bash
          npm install nightwatch nightwatch-browserstack --save-dev
          \`\`\`

          ---STEP---
          Update your Nightwatch config file (e.g., \`nightwatch.conf.js\`) to add the BrowserStack settings and capabilities:

          \`\`\`js
          module.exports = {
            src_folders: ["tests"],
            test_settings: {
              default: {
                selenium: {
                  start_process: false,
                  host: "hub.browserstack.com",
                  port: 443,
                },
                desiredCapabilities: {
                  "bstack:options": {
                    userName: process.env.BROWSERSTACK_USERNAME || "${username}",
                    accessKey: process.env.BROWSERSTACK_ACCESS_KEY || "${accessKey}",
                    deviceName: "Samsung Galaxy S22 Ultra",
                    osVersion: "12.0",
                    projectName: "BrowserStack Sample",
                    buildName: "bstack-demo",
                    sessionName: "Nightwatch App Automate Test",
                    debug: true,
                    networkLogs: true,
                  },
                  app: "bs://sample.app",
                  platformName: "android",
                },
              },
            },
          };
          \`\`\`
          `
        );
      }
      break;
    }
  }

  return "";
}
