import { assertOkResponse } from "../../lib/utils.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";
import { apiClient } from "../../lib/apiClient.js";
export async function getSelfHealSelectors(sessionId, config) {
    const authString = getBrowserStackAuth(config);
    const auth = Buffer.from(authString).toString("base64");
    const url = `https://api.browserstack.com/automate/sessions/${sessionId}/logs`;
    const response = await apiClient.get({
        url,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
    });
    await assertOkResponse(response, "session logs");
    const logText = typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    return extractHealedSelectors(logText);
}
function extractHealedSelectors(logText) {
    // Split log text into lines for easier context handling
    const logLines = logText.split("\n");
    // Pattern to match successful SELFHEAL entries only
    const selfhealPattern = /SELFHEAL\s*{\s*"status":"true",\s*"data":\s*{\s*"using":"css selector",\s*"value":"(.*?)"}/;
    // Pattern to match preceding selector requests
    const requestPattern = /POST \/session\/[^/]+\/element.*?"using":"css selector","value":"(.*?)"/;
    // Find all successful healed selectors with their line numbers and context
    const healedMappings = [];
    for (let i = 0; i < logLines.length; i++) {
        const match = logLines[i].match(selfhealPattern);
        if (match) {
            const beforeLine = i > 0 ? logLines[i - 1] : "";
            const afterLine = i < logLines.length - 1 ? logLines[i + 1] : "";
            // Look backwards to find the most recent original selector request
            let originalSelector = "UNKNOWN";
            for (let j = i - 1; j >= 0; j--) {
                const requestMatch = logLines[j].match(requestPattern);
                if (requestMatch) {
                    originalSelector = requestMatch[1];
                    break;
                }
            }
            healedMappings.push({
                originalSelector,
                healedSelector: match[1],
                context: {
                    before: beforeLine,
                    after: afterLine,
                },
            });
        }
    }
    return healedMappings;
}
