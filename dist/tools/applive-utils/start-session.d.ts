import { BrowserStackConfig } from "../../lib/types.js";
interface StartSessionArgs {
    appPath: string;
    desiredPlatform: "android" | "ios";
    desiredPhone: string;
    desiredPlatformVersion: string;
}
interface StartSessionOptions {
    config: BrowserStackConfig;
}
/**
 * Start an App Live session: filter, select, upload, and open.
 */
export declare function startSession(args: StartSessionArgs, options: StartSessionOptions): Promise<string>;
export {};
