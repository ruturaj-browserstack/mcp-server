import logger from "../logger.js";
import { getBrowserStackAuth } from "./get-auth.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../../package.json");
import axios from "axios";
export function trackMCP(toolName, clientInfo, error, config) {
    const instrumentationEndpoint = "https://api.browserstack.com/sdk/v1/event";
    const isSuccess = !error;
    const mcpClient = clientInfo?.name || "unknown";
    // Log client information
    if (clientInfo?.name) {
        logger.info(`Client connected: ${clientInfo.name} (version: ${clientInfo.version})`);
    }
    else {
        logger.info("Client connected: unknown client");
    }
    const event = {
        event_type: "MCPInstrumentation",
        event_properties: {
            mcp_version: packageJson.version,
            tool_name: toolName,
            mcp_client: mcpClient,
            success: isSuccess,
        },
    };
    // Add error details if applicable
    if (error) {
        event.event_properties.error_message =
            error instanceof Error ? error.message : String(error);
        event.event_properties.error_type =
            error instanceof Error ? error.constructor.name : "Unknown";
    }
    let authHeader = undefined;
    if (config) {
        const authString = getBrowserStackAuth(config);
        authHeader = `Basic ${Buffer.from(authString).toString("base64")}`;
    }
    axios
        .post(instrumentationEndpoint, event, {
        headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        timeout: 2000,
    })
        .catch(() => { });
}
