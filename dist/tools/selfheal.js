import { z } from "zod";
import { getSelfHealSelectors } from "./selfheal-utils/selfheal.js";
import logger from "../logger.js";
import { trackMCP } from "../lib/instrumentation.js";
// Tool function that fetches self-healing selectors
export async function fetchSelfHealSelectorTool(args, config) {
    try {
        const selectors = await getSelfHealSelectors(args.sessionId, config);
        return {
            content: [
                {
                    type: "text",
                    text: "Self-heal selectors fetched successfully" +
                        JSON.stringify(selectors),
                },
            ],
        };
    }
    catch (error) {
        logger.error("Error fetching self-heal selector suggestions", error);
        throw error;
    }
}
// Registers the fetchSelfHealSelector tool with the MCP server
export default function addSelfHealTools(server, config) {
    server.tool("fetchSelfHealedSelectors", "Retrieves AI-generated, self-healed selectors for a BrowserStack Automate session to resolve flaky tests caused by dynamic DOM changes.", {
        sessionId: z.string().describe("The session ID of the test run"),
    }, async (args) => {
        try {
            trackMCP("fetchSelfHealedSelectors", server.server.getClientVersion(), undefined, config);
            return await fetchSelfHealSelectorTool(args, config);
        }
        catch (error) {
            trackMCP("fetchSelfHealedSelectors", server.server.getClientVersion(), error, config);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [
                    {
                        type: "text",
                        text: `Error during fetching self-heal suggestions: ${errorMessage}`,
                    },
                ],
            };
        }
    });
}
