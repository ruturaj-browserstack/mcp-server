import { PERCY_WEB_NOT_IMPLEMENTED } from "../errorMessages.js";
/**
 * Handler for Percy Web only mode
 * Currently not implemented - returns error step with minimal formatting
 */
export function runPercyWeb() {
    const steps = [
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
