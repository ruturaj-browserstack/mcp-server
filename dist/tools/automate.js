import { z } from "zod";
import { fetchAutomationScreenshots } from "./automate-utils/fetch-screenshots.js";
import { SessionType } from "../lib/constants.js";
import { trackMCP } from "../lib/instrumentation.js";
import logger from "../logger.js";
// Tool function that fetches and processes screenshots from BrowserStack Automate session
export async function fetchAutomationScreenshotsTool(args, config) {
    try {
        const screenshots = await fetchAutomationScreenshots(args.sessionId, args.sessionType, config);
        if (screenshots.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No screenshots found in the session or some unexpected error occurred",
                    },
                ],
                isError: true,
            };
        }
        const results = screenshots.map((screenshot, index) => ({
            type: "image",
            text: `Screenshot ${index + 1}`,
            data: screenshot.base64,
            mimeType: "image/png",
            metadata: { url: screenshot.url },
        }));
        return {
            content: [
                {
                    type: "text",
                    text: `Retrieved ${screenshots.length} screenshot(s) from the end of the session.`,
                },
                ...results,
            ],
        };
    }
    catch (error) {
        logger.error("Error during fetching screenshots", error);
        throw error;
    }
}
//Registers the fetchAutomationScreenshots tool with the MCP server
export default function addAutomationTools(server, config) {
    server.tool("fetchAutomationScreenshots", "Fetch and process screenshots from a BrowserStack Automate session", {
        sessionId: z
            .string()
            .describe("The BrowserStack session ID to fetch screenshots from"),
        sessionType: z
            .enum([SessionType.Automate, SessionType.AppAutomate])
            .describe("Type of BrowserStack session"),
    }, async (args) => {
        try {
            trackMCP("fetchAutomationScreenshots", server.server.getClientVersion(), undefined, config);
            return await fetchAutomationScreenshotsTool(args, config);
        }
        catch (error) {
            trackMCP("fetchAutomationScreenshots", server.server.getClientVersion(), error, config);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [
                    {
                        type: "text",
                        text: `Error during fetching automate screenshots: ${errorMessage}`,
                    },
                ],
            };
        }
    });
}
