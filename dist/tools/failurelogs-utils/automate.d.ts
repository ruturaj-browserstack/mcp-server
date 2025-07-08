import { BrowserStackConfig } from "../../lib/types.js";
export declare function retrieveNetworkFailures(sessionId: string, config: BrowserStackConfig): Promise<string>;
export declare function retrieveSessionFailures(sessionId: string, config: BrowserStackConfig): Promise<string>;
export declare function retrieveConsoleFailures(sessionId: string, config: BrowserStackConfig): Promise<string>;
export declare function filterSessionFailures(logText: string): string[];
export declare function filterConsoleFailures(logText: string): string[];
