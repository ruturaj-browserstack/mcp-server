import { SessionType } from "../../lib/constants.js";
import { BrowserStackConfig } from "../../lib/types.js";
export declare function fetchAutomationScreenshots(sessionId: string, sessionType: SessionType | undefined, config: BrowserStackConfig): Promise<{
    url: string;
    base64: string;
}[]>;
