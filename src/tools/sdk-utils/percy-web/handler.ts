// Handler for Percy Web only mode - Currently not implemented
import { RunTestsInstructionResult, RunTestsStep } from "../common/types.js";
import { PERCY_WEB_NOT_IMPLEMENTED } from "../common/errorMessages.js";

export function runPercyWeb(): RunTestsInstructionResult {
  const steps: RunTestsStep[] = [
    {
      type: "error",
      title: "Percy Web Not Implemented",
      content: PERCY_WEB_NOT_IMPLEMENTED,
      isError: true,
    },
  ];

  return {
    steps,
    requiresPercy: true,
    missingDependencies: [],
    shouldSkipFormatting: true, // Skip formatting for not implemented features
  };
}
