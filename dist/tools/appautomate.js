import { z } from "zod";
import logger from "../logger.js";
import { getBrowserStackAuth } from "../lib/get-auth.js";
import { trackMCP } from "../lib/instrumentation.js";
import { maybeCompressBase64 } from "../lib/utils.js";
import { remote } from "webdriverio";
import { AppTestPlatform } from "./appautomate-utils/types.js";
import { getDevicesAndBrowsers, BrowserStackProducts, } from "../lib/device-cache.js";
import { findMatchingDevice, getDeviceVersions, resolveVersion, validateArgs, uploadApp, uploadEspressoApp, uploadEspressoTestSuite, triggerEspressoBuild, uploadXcuiApp, uploadXcuiTestSuite, triggerXcuiBuild, } from "./appautomate-utils/appautomate.js";
var Platform;
(function (Platform) {
    Platform["ANDROID"] = "android";
    Platform["IOS"] = "ios";
})(Platform || (Platform = {}));
/**
 * Launches an app on a selected BrowserStack device and takes a screenshot.
 */
async function takeAppScreenshot(args) {
    let driver;
    try {
        validateArgs(args);
        const { desiredPlatform, desiredPhone, appPath, config } = args;
        let { desiredPlatformVersion } = args;
        const platforms = (await getDevicesAndBrowsers(BrowserStackProducts.APP_AUTOMATE)).mobile;
        const platformData = platforms.find((p) => p.os === desiredPlatform.toLowerCase());
        if (!platformData) {
            throw new Error(`Platform ${desiredPlatform} not found in device cache.`);
        }
        const matchingDevices = findMatchingDevice(platformData.devices, desiredPhone);
        const availableVersions = getDeviceVersions(matchingDevices);
        desiredPlatformVersion = resolveVersion(availableVersions, desiredPlatformVersion);
        const selectedDevice = matchingDevices.find((d) => d.os_version === desiredPlatformVersion);
        if (!selectedDevice) {
            throw new Error(`Device "${desiredPhone}" with version ${desiredPlatformVersion} not found.`);
        }
        const authString = getBrowserStackAuth(config);
        const [username, password] = authString.split(":");
        const app_url = await uploadApp(appPath, username, password);
        logger.info(`App uploaded. URL: ${app_url}`);
        const capabilities = {
            platformName: desiredPlatform,
            "appium:platformVersion": selectedDevice.os_version,
            "appium:deviceName": selectedDevice.device,
            "appium:app": app_url,
            "appium:autoGrantPermissions": true,
            "bstack:options": {
                userName: username,
                accessKey: password,
                appiumVersion: "2.0.1",
            },
        };
        logger.info("Starting WebDriver session on BrowserStack...");
        try {
            driver = await remote({
                protocol: "https",
                hostname: "hub.browserstack.com",
                port: 443,
                path: "/wd/hub",
                capabilities,
            });
        }
        catch (error) {
            logger.error("Error initializing WebDriver:", error);
            throw new Error("Failed to initialize the WebDriver or a timeout occurred. Please try again.");
        }
        const screenshotBase64 = await driver.takeScreenshot();
        const compressed = await maybeCompressBase64(screenshotBase64);
        return {
            content: [
                {
                    type: "image",
                    data: compressed,
                    mimeType: "image/png",
                    name: `screenshot-${selectedDevice.device}-${Date.now()}`,
                },
            ],
        };
    }
    catch (error) {
        logger.error("Error during app automation or screenshot capture", error);
        throw error;
    }
    finally {
        if (driver) {
            logger.info("Cleaning up WebDriver session...");
            await driver.deleteSession();
        }
    }
}
//Runs AppAutomate tests on BrowserStack by uploading app and test suite, then triggering a test run.
async function runAppTestsOnBrowserStack(args, config) {
    switch (args.detectedAutomationFramework) {
        case AppTestPlatform.ESPRESSO: {
            try {
                const app_url = await uploadEspressoApp(args.appPath, config);
                const test_suite_url = await uploadEspressoTestSuite(args.testSuitePath, config);
                const build_id = await triggerEspressoBuild(app_url, test_suite_url, args.devices, args.project);
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Espresso run started successfully!\n\n🔧 Build ID: ${build_id}\n🔗 View your build: https://app-automate.browserstack.com/builds/${build_id}`,
                        },
                    ],
                };
            }
            catch (err) {
                logger.error("Error running App Automate test", err);
                throw err;
            }
        }
        case AppTestPlatform.XCUITEST: {
            try {
                const app_url = await uploadXcuiApp(args.appPath, config);
                const test_suite_url = await uploadXcuiTestSuite(args.testSuitePath, config);
                const build_id = await triggerXcuiBuild(app_url, test_suite_url, args.devices, args.project, config);
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ XCUITest run started successfully!\n\n🔧 Build ID: ${build_id}\n🔗 View your build: https://app-automate.browserstack.com/builds/${build_id}`,
                        },
                    ],
                };
            }
            catch (err) {
                logger.error("Error running XCUITest App Automate test", err);
                throw err;
            }
        }
        default:
            throw new Error(`Unsupported automation framework: ${args.detectedAutomationFramework}. If you need support for this framework, please open an issue at Github`);
    }
}
export default function addAppAutomationTools(server, config) {
    const tools = {};
    tools.takeAppScreenshot = server.tool("takeAppScreenshot", "Use this tool to take a screenshot of an app running on a BrowserStack device. This is useful for visual testing and debugging.", {
        desiredPhone: z
            .string()
            .describe("The full name of the device to run the app on. Example: 'iPhone 12 Pro' or 'Samsung Galaxy S20'. Always ask the user for the device they want to use."),
        desiredPlatformVersion: z
            .string()
            .describe("The platform version to run the app on. Use 'latest' or 'oldest' for dynamic resolution."),
        desiredPlatform: z
            .enum([Platform.ANDROID, Platform.IOS])
            .describe("Platform to run the app on. Either 'android' or 'ios'."),
        appPath: z
            .string()
            .describe("The path to the .apk or .ipa file. Required for app installation."),
    }, async (args) => {
        try {
            trackMCP("takeAppScreenshot", server.server.getClientVersion(), undefined, config);
            return await takeAppScreenshot({ ...args, config });
        }
        catch (error) {
            trackMCP("takeAppScreenshot", server.server.getClientVersion(), error, config);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [
                    {
                        type: "text",
                        text: `Error during app automation or screenshot capture: ${errorMessage}`,
                    },
                ],
            };
        }
    });
    tools.runAppTestsOnBrowserStack = server.tool("runAppTestsOnBrowserStack", "Run AppAutomate tests on BrowserStack by uploading app and test suite. If running from Android Studio or Xcode, the tool will help export app and test files automatically. For other environments, you'll need to provide the paths to your pre-built app and test files.", {
        appPath: z
            .string()
            .describe("Path to your application file:\n" +
            "If in development IDE directory:\n" +
            "• For Android: 'gradle assembleDebug'\n" +
            "• For iOS:\n" +
            "  xcodebuild clean -scheme YOUR_SCHEME && \\\n" +
            "  xcodebuild archive -scheme YOUR_SCHEME -configuration Release -archivePath build/app.xcarchive && \\\n" +
            "  xcodebuild -exportArchive -archivePath build/app.xcarchive -exportPath build/ipa -exportOptionsPlist exportOptions.plist\n\n" +
            "If in other directory, provide existing app path"),
        testSuitePath: z
            .string()
            .describe("Path to your test suite file:\n" +
            "If in development IDE directory:\n" +
            "• For Android: 'gradle assembleAndroidTest'\n" +
            "• For iOS:\n" +
            "  xcodebuild test-without-building -scheme YOUR_SCHEME -destination 'generic/platform=iOS' && \\\n" +
            "  cd ~/Library/Developer/Xcode/DerivedData/*/Build/Products/Debug-iphonesimulator/ && \\\n" +
            "  zip -r Tests.zip *.xctestrun *-Runner.app\n\n" +
            "If in other directory, provide existing test file path"),
        devices: z
            .array(z.string())
            .describe("List of devices to run the test on, e.g., ['Samsung Galaxy S20-10.0', 'iPhone 12 Pro-16.0']."),
        project: z
            .string()
            .optional()
            .default("BStack-AppAutomate-Suite")
            .describe("Project name for organizing test runs on BrowserStack."),
        detectedAutomationFramework: z
            .string()
            .describe("The automation framework used in the project, such as 'espresso' (Android) or 'xcuitest' (iOS)."),
    }, async (args) => {
        try {
            trackMCP("runAppTestsOnBrowserStack", server.server.getClientVersion(), undefined, config);
            return await runAppTestsOnBrowserStack(args, config);
        }
        catch (error) {
            trackMCP("runAppTestsOnBrowserStack", server.server.getClientVersion(), error, config);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [
                    {
                        type: "text",
                        text: `Error running App Automate test: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    });
    return tools;
}
