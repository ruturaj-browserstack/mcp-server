import { BrowserStackConfig } from "../../lib/types.js";
export declare function retrieveDeviceLogs(sessionId: string, buildId: string, config: BrowserStackConfig): Promise<string>;
export declare function retrieveAppiumLogs(sessionId: string, buildId: string, config: BrowserStackConfig): Promise<string>;
export declare function retrieveCrashLogs(sessionId: string, buildId: string, config: BrowserStackConfig): Promise<string>;
export declare function filterDeviceFailures(logText: string): string[];
export declare function filterAppiumFailures(logText: string): string[];
export declare function filterCrashFailures(logText: string): string[];
