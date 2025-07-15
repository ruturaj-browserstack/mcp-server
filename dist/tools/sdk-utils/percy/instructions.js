import { PERCY_INSTRUCTIONS } from "./constants.js";
/**
 * Retrieves Percy-specific instructions for a given language and framework.
 */
export function getPercyInstructions(language, automationFramework, testingFramework) {
    const langConfig = PERCY_INSTRUCTIONS[language];
    if (!langConfig) {
        return null;
    }
    const frameworkConfig = langConfig[automationFramework];
    if (!frameworkConfig) {
        return null;
    }
    const percyInstructions = frameworkConfig[testingFramework];
    if (!percyInstructions) {
        return null;
    }
    return percyInstructions;
}
/**
 * Formats the retrieved Percy instructions into a user-friendly string.
 */
export function formatPercyInstructions(instructions) {
    return `\n\n## Percy Visual Testing Setup
To enable visual testing with Percy, you need to make the following changes to your project configuration and test scripts.
${instructions.script_updates}
`;
}
