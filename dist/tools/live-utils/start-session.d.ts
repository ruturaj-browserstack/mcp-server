import { DesktopSearchArgs, MobileSearchArgs } from "./types.js";
import { BrowserStackConfig } from "../../lib/types.js";
/**
 * Entrypoint: detects platformType & delegates.
 */
export declare function startBrowserSession(args: DesktopSearchArgs | MobileSearchArgs, config: BrowserStackConfig): Promise<string>;
