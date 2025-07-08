/**
 * USE_OWN_LOCAL_BINARY_PROCESS:
 *   If true, the system will not start a new local binary process, but will use the user's own process.
 */
export declare class Config {
    readonly DEV_MODE: boolean;
    readonly browserstackLocalOptions: Record<string, any>;
    readonly USE_OWN_LOCAL_BINARY_PROCESS: boolean;
    readonly REMOTE_MCP: boolean;
    constructor(DEV_MODE: boolean, browserstackLocalOptions: Record<string, any>, USE_OWN_LOCAL_BINARY_PROCESS: boolean, REMOTE_MCP: boolean);
}
declare const config: Config;
export default config;
