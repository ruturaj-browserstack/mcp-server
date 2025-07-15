// Handler for Percy Automate only (fallback when Percy SDK not supported)
import { RunTestsInstructionResult } from "../common/types.js";
import { PERCY_AUTOMATE_NOT_IMPLEMENTED } from "../common/errorMessages.js";

// Placeholder function for Percy Automate fallback
// Returns null if not supported, instructions string if supported
function getPercyAutomateInstructions(): string | null {
  return "It worked as a fallback for Percy Automate.";
}

export function runPercyAutomateOnly(): RunTestsInstructionResult {
  const percyAutomateInstructions = getPercyAutomateInstructions();

  if (percyAutomateInstructions) {
    return {
      steps: [
        {
          type: "instruction",
          title: "Percy Automate Setup (Fallback)",
          content: percyAutomateInstructions,
        },
      ],
      requiresPercy: true,
      missingDependencies: [],
      shouldSkipFormatting: false,
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
    shouldSkipFormatting: true,
  };
}
