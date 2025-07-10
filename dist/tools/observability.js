import { z } from "zod";
import { getLatestO11YBuildInfo } from "../lib/api.js";
import { trackMCP } from "../lib/instrumentation.js";
import logger from "../logger.js";
export async function getFailuresInLastRun(buildName, projectName, config) {
    const buildsData = await getLatestO11YBuildInfo(buildName, projectName, config);
    if (!buildsData.data) {
        throw new Error("No observability URL found in build data, this is likely because the build is not yet available on BrowserStack Observability.");
    }
    const observabilityUrl = buildsData.data.observability_url;
    if (!observabilityUrl) {
        throw new Error("No observability URL found in build data, this is likely because the build is not yet available on BrowserStack Observability.");
    }
    let overview = "No overview available";
    if (buildsData.data.unique_errors?.overview?.insight) {
        overview = buildsData.data.unique_errors.overview.insight;
    }
    let details = "No error details available";
    if (buildsData.data.unique_errors?.top_unique_errors?.length > 0) {
        details = buildsData.data.unique_errors.top_unique_errors
            .map((error) => error.error)
            .filter(Boolean)
            .join("\n");
    }
    return {
        content: [
            {
                type: "text",
                text: `Observability URL: ${observabilityUrl}\nOverview: ${overview}\nError Details: ${details}`,
            },
        ],
    };
}
export default function addObservabilityTools(server, config) {
    server.tool("getFailuresInLastRun", "Use this tool to debug failures in the last run of the test suite on BrowserStack. Use only when browserstack.yml file is present in the project root.", {
        buildName: z
            .string()
            .describe("Name of the build to get failures for. This is the 'build' key in the browserstack.yml file. If not sure, ask the user for the build name."),
        projectName: z
            .string()
            .describe("Name of the project to get failures for. This is the 'projectName' key in the browserstack.yml file. If not sure, ask the user for the project name."),
    }, async (args) => {
        try {
            trackMCP("getFailuresInLastRun", server.server.getClientVersion(), undefined, config);
            return await getFailuresInLastRun(args.buildName, args.projectName, config);
        }
        catch (error) {
            logger.error("Failed to get failures in the last run: %s", error);
            trackMCP("getFailuresInLastRun", server.server.getClientVersion(), error, config);
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get failures in the last run. Error: ${error}. Please open an issue on GitHub if this is an issue with BrowserStack`,
                        isError: true,
                    },
                ],
                isError: true,
            };
        }
    });
}
