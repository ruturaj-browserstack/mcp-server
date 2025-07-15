// List of supported BrowserStack Local option names (as per SDK)
const BROWSERSTACK_LOCAL_OPTION_KEYS = [
    "proxyHost",
    "proxyPort",
    "proxyUser",
    "proxyPass",
    "useCaCertificate",
    "localProxyHost",
    "localProxyPort",
    "localProxyUser",
    "localProxyPass",
    "pacFile",
    "force",
    "forceLocal",
    "onlyAutomate",
    "verbose",
    "logFile",
    "binarypath",
    "f",
    "excludeHosts",
];
// Build browserstackLocalOptions from individual env vars
const browserstackLocalOptions = {};
for (const key of BROWSERSTACK_LOCAL_OPTION_KEYS) {
    // Env var name: BROWSERSTACK_LOCAL_OPTION_<UPPERCASE_KEY>
    const envVar = process.env[`BROWSERSTACK_LOCAL_OPTION_${key.toUpperCase()}`];
    if (envVar !== undefined) {
        browserstackLocalOptions[key] = envVar;
    }
}
/**
 * USE_OWN_LOCAL_BINARY_PROCESS:
 *   If true, the system will not start a new local binary process, but will use the user's own process.
 */
export class Config {
    DEV_MODE;
    browserstackLocalOptions;
    USE_OWN_LOCAL_BINARY_PROCESS;
    REMOTE_MCP;
    constructor(DEV_MODE, browserstackLocalOptions, USE_OWN_LOCAL_BINARY_PROCESS, REMOTE_MCP) {
        this.DEV_MODE = DEV_MODE;
        this.browserstackLocalOptions = browserstackLocalOptions;
        this.USE_OWN_LOCAL_BINARY_PROCESS = USE_OWN_LOCAL_BINARY_PROCESS;
        this.REMOTE_MCP = REMOTE_MCP;
    }
}
const config = new Config(process.env.DEV_MODE === "true", browserstackLocalOptions, process.env.USE_OWN_LOCAL_BINARY_PROCESS === "true", process.env.REMOTE_MCP === "true");
export default config;
