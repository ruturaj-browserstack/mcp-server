import { assertOkResponse, maybeCompressBase64 } from "../../lib/utils.js";
import { SessionType } from "../../lib/constants.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";
import { apiClient } from "../../lib/apiClient.js";
async function extractScreenshotUrls(sessionId, sessionType, config) {
    const authString = getBrowserStackAuth(config);
    const auth = Buffer.from(authString).toString("base64");
    const baseUrl = `https://api.browserstack.com/${sessionType === SessionType.Automate ? "automate" : "app-automate"}`;
    const url = `${baseUrl}/sessions/${sessionId}/logs`;
    const response = await apiClient.get({
        url,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        raise_error: false,
    });
    await assertOkResponse(response, "Session");
    const text = typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    const urls = [];
    const SCREENSHOT_PATTERN = /REQUEST.*GET.*\/screenshot/;
    const RESPONSE_VALUE_PATTERN = /"value"\s*:\s*"([^"]+)"/;
    // Split logs into lines and process them
    const lines = text.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];
        if (SCREENSHOT_PATTERN.test(currentLine)) {
            const match = nextLine.match(RESPONSE_VALUE_PATTERN);
            if (match && match[1]) {
                urls.push(match[1]);
            }
        }
    }
    return urls;
}
//Converts screenshot URLs to base64 encoded images
async function convertUrlsToBase64(urls) {
    const screenshots = await Promise.all(urls.map(async (url) => {
        const response = await apiClient.get({ url });
        // Axios returns response.data as a Buffer for binary data
        const base64 = Buffer.from(response.data).toString("base64");
        // Compress the base64 image if needed
        const compressedBase64 = await maybeCompressBase64(base64);
        return {
            url,
            base64: compressedBase64,
        };
    }));
    return screenshots;
}
//Fetches and converts screenshot URLs to base64 encoded images
export async function fetchAutomationScreenshots(sessionId, sessionType = SessionType.Automate, config) {
    const urls = await extractScreenshotUrls(sessionId, sessionType, config);
    if (urls.length === 0) {
        return [];
    }
    // Take only the last 5 URLs
    const lastFiveUrls = urls.slice(-5);
    return await convertUrlsToBase64(lastFiveUrls);
}
