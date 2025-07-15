import { RunTestsOnBrowserStackSchema } from "./schema.js";
import { buildRunTestsInstructions } from "./instructionBuilder.js";
import { BOOTSTRAP_FAILED } from "./errorMessages.js";
import { IMPORTANT_SETUP_WARNING } from "../instructions.js";
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

    // Format steps for output (only for supported cases)
    const formattedSteps = steps.map((step, idx) => ({
      type: "text" as const,
      text: `Step ${idx + 1}: ${step.title}\n${step.content}`,
    }));

    // Add setup warning only for supported cases
    formattedSteps.unshift({
      type: "text" as const,
      text: IMPORTANT_SETUP_WARNING,
    });

    // Structured output
    return {
      content: formattedSteps,
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
