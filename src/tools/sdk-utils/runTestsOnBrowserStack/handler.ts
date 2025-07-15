import { RunTestsOnBrowserStackSchema } from "./schema.js";
import { buildRunTestsInstructions } from "./instructionBuilder.js";
import { BOOTSTRAP_FAILED, IMPORTANT_SETUP_WARNING } from "./errorMessages.js";
import { formatInstructionsWithNumbers, generateVerificationMessage } from "./formatUtils.js";
import { BrowserStackConfig } from "../../../lib/types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Handler for the runTestsOnBrowserStack tool.
 * Validates input, builds instructions, and returns structured output.
 */
export async function runTestsOnBrowserStackHandler(
  rawInput: unknown,
  config: BrowserStackConfig,
): Promise<CallToolResult> {
  try {
    // Validate input with schema
    const input = RunTestsOnBrowserStackSchema.parse(rawInput);

    // Build instructions and metadata
    const { steps, requiresPercy, missingDependencies, shouldSkipFormatting } =
      buildRunTestsInstructions(input, config);

    // If shouldSkipFormatting is true (for unsupported cases), return minimal response
    if (shouldSkipFormatting) {
      return {
        content: steps.map((step) => ({
          type: "text" as const,
          text: step.content,
        })),
        isError: steps.some((s) => s.isError),
        steps,
        requiresPercy,
        missingDependencies,
      };
    }

    // Combine all step content into a single string for formatting
    const combinedInstructions = steps.map(step => step.content).join('\n');
    
    // Apply step numbering using the formatInstructionsWithNumbers function
    const { formattedSteps, stepCount } = formatInstructionsWithNumbers(combinedInstructions);
    
    // Generate verification message
    const verificationMessage = generateVerificationMessage(stepCount);
    
    // Create the final content with setup warning, formatted instructions, and verification
    const finalContent = [
      {
        type: "text" as const,
        text: IMPORTANT_SETUP_WARNING,
      },
      {
        type: "text" as const,
        text: formattedSteps,
      },
      {
        type: "text" as const,
        text: verificationMessage,
      }
    ];

    // Structured output
    return {
      content: finalContent,
      isError: steps.some((s) => s.isError),
      steps,
      requiresPercy,
      missingDependencies,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: BOOTSTRAP_FAILED(error, {
            config,
            percyMode: (rawInput as any)?.percyMode,
          }),
          isError: true,
        },
      ],
      isError: true,
    };
  }
}
