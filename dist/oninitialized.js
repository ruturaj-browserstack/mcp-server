import { trackMCP } from "./lib/instrumentation.js";
export function setupOnInitialized(server, config) {
    const nodeVersion = process.versions.node;
    // Check for Node.js version
    if (nodeVersion < "18.0.0") {
        throw new Error("Node version is not supported. Please upgrade to 18.0.0 or later.");
    }
    server.server.oninitialized = () => {
        trackMCP("started", server.server.getClientVersion(), undefined, config);
    };
}
