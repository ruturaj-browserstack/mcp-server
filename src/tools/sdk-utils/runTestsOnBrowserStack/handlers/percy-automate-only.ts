import { RunTestsInstructionResult } from "../instructionBuilder.js";
import { PERCY_AUTOMATE_NOT_IMPLEMENTED } from "../errorMessages.js";

/**
 * Placeholder function for Percy Automate fallback
 * Returns null if not supported, instructions string if supported
 */
function getPercyAutomateInstructions(): string | null {
  // TODO: Implement real logic for Percy Automate fallback
  // For now, return null to indicate not implemented
  return null;
}

/**
 * Handler for Percy Automate only (fallback when Percy SDK not supported)
 * Currently not implemented - returns error step with minimal formatting
 */
export function runPercyAutomateOnly(): RunTestsInstructionResult {
  const percyAutomateInstructions = getPercyAutomateInstructions();

  if (percyAutomateInstructions) {
    return {
      steps: [
        {
          type: "percy",
          title: "Percy Automate Setup (Fallback)",
          content: percyAutomateInstructions,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
      shouldSkipFormatting: false, // This would be a valid implementation
    };
  }

  // Percy Automate not supported - skip formatting for error case
  return {
    steps: [
      {
        type: "error",
        title: "Percy Automate Not Supported",
        content: PERCY_AUTOMATE_NOT_IMPLEMENTED,
        isError: true,
      },
    ],
    requiresPercy: true,
    missingDependencies: [],
    shouldSkipFormatting: true, // Skip formatting for not implemented features
  };
}
