import { z } from "zod";
import { trackMCP } from "../lib/instrumentation.js";
import { getSDKPrefixCommand } from "./sdk-utils/commands.js";
import { SDKSupportedLanguageEnum, SDKSupportedBrowserAutomationFrameworkEnum, SDKSupportedTestingFrameworkEnum, } from "./sdk-utils/types.js";
import { generateBrowserStackYMLInstructions, getInstructionsForProjectConfiguration, formatInstructionsWithNumbers, } from "./sdk-utils/instructions.js";
import { formatPercyInstructions, getPercyInstructions, } from "./sdk-utils/percy/instructions.js";
import { getBrowserStackAuth } from "../lib/get-auth.js";
/**
 * BrowserStack SDK hooks into your test framework to seamlessly run tests on BrowserStack.
 * This tool gives instructions to setup a browserstack.yml file in the project root and installs the necessary dependencies.
 */
export async function bootstrapProjectWithSDK({ detectedBrowserAutomationFramework, detectedTestingFramework, detectedLanguage, desiredPlatforms, enablePercy, config, }) {
    // Get credentials from config
    const authString = getBrowserStackAuth(config);
    const [username, accessKey] = authString.split(":");
    // Handle frameworks with unique setup instructions that don't use browserstack.yml
    if (detectedBrowserAutomationFramework === "cypress" ||
        detectedTestingFramework === "webdriverio") {
        let combinedInstructions = getInstructionsForProjectConfiguration(detectedBrowserAutomationFramework, detectedTestingFramework, detectedLanguage, username, accessKey);
        if (enablePercy) {
            const percyInstructions = getPercyInstructions(detectedLanguage, detectedBrowserAutomationFramework, detectedTestingFramework);
            if (percyInstructions) {
                combinedInstructions +=
                    "\n\n" + formatPercyInstructions(percyInstructions);
            }
            else {
                throw new Error(`Percy is currently not supported through MCP for ${detectedLanguage} with ${detectedTestingFramework}. If you want to run the test cases without Percy, disable Percy and run it again.`);
            }
        }
        // Apply consistent formatting for all configurations
        return formatFinalInstructions(combinedInstructions);
    }
    // Handle default flow using browserstack.yml
    const sdkSetupCommand = getSDKPrefixCommand(detectedLanguage, detectedTestingFramework, username, accessKey);
    const ymlInstructions = generateBrowserStackYMLInstructions(desiredPlatforms, enablePercy);
    const instructionsForProjectConfiguration = getInstructionsForProjectConfiguration(detectedBrowserAutomationFramework, detectedTestingFramework, detectedLanguage, username, accessKey);
    let combinedInstructions = "";
    // Step 1: Add SDK setup command
    if (sdkSetupCommand) {
        combinedInstructions += sdkSetupCommand;
    }
    // Step 2: Add browserstack.yml setup
    if (ymlInstructions) {
        combinedInstructions += "\n\n---STEP---\n" + ymlInstructions;
    }
    // Step 3: Add language/framework-specific setup
    if (instructionsForProjectConfiguration) {
        combinedInstructions += "\n\n" + instructionsForProjectConfiguration;
    }
    // Step 4: Add Percy setup if applicable
    if (enablePercy) {
        const percyInstructions = getPercyInstructions(detectedLanguage, detectedBrowserAutomationFramework, detectedTestingFramework);
        if (percyInstructions) {
            combinedInstructions +=
                "\n\n" + formatPercyInstructions(percyInstructions);
        }
        else {
            throw new Error(`Percy is currently not supported through MCP for ${detectedLanguage} with ${detectedTestingFramework}. If you want to run the test cases without Percy, disable Percy and run it again.`);
        }
    }
    // Apply consistent formatting for all configurations
    return formatFinalInstructions(combinedInstructions);
}
// Helper function to apply consistent formatting to all instruction types
function formatFinalInstructions(combinedInstructions) {
    const fullInstructions = `⚠️ IMPORTANT: DO NOT SKIP ANY STEP
  All the setup steps described in this file MUST be executed regardless of any existing configuration or setup.
  This ensures proper BrowserStack SDK setup.

  ${formatInstructionsWithNumbers(combinedInstructions)}`;
    return {
        content: [
            {
                type: "text",
                text: fullInstructions,
                isError: false,
            },
        ],
    };
}
export default function addSDKTools(server, config) {
    server.tool("runTestsOnBrowserStack", "Use this tool to get instructions for running tests on BrowserStack and BrowserStack Percy. It sets up the BrowserStack SDK and runs your test cases on BrowserStack.", {
        detectedBrowserAutomationFramework: z
            .nativeEnum(SDKSupportedBrowserAutomationFrameworkEnum)
            .describe("The automation framework configured in the project. Example: 'playwright', 'selenium'"),
        detectedTestingFramework: z
            .nativeEnum(SDKSupportedTestingFrameworkEnum)
            .describe("The testing framework used in the project. Be precise with framework selection Example: 'webdriverio', 'jest', 'pytest', 'junit4', 'junit5', 'mocha'"),
        detectedLanguage: z
            .nativeEnum(SDKSupportedLanguageEnum)
            .describe("The programming language used in the project. Example: 'nodejs', 'python', 'java', 'csharp'"),
        desiredPlatforms: z
            .array(z.enum(["windows", "macos", "android", "ios"]))
            .describe("The platforms the user wants to test on. Always ask this to the user, do not try to infer this."),
        enablePercy: z
            .boolean()
            .optional()
            .default(false)
            .describe("Set to true if the user wants to enable Percy for visual testing. Defaults to false."),
    }, async (args) => {
        try {
            trackMCP("runTestsOnBrowserStack", server.server.getClientVersion(), undefined, config);
            return await bootstrapProjectWithSDK({
                detectedBrowserAutomationFramework: args.detectedBrowserAutomationFramework,
                detectedTestingFramework: args.detectedTestingFramework,
                detectedLanguage: args.detectedLanguage,
                desiredPlatforms: args.desiredPlatforms,
                enablePercy: args.enablePercy,
                config,
            });
        }
        catch (error) {
            trackMCP("runTestsOnBrowserStack", server.server.getClientVersion(), error, config);
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to bootstrap project with BrowserStack SDK. Error: ${error}. Please open an issue on GitHub if the problem persists`,
                        isError: true,
                    },
                ],
                isError: true,
            };
        }
    });
}
