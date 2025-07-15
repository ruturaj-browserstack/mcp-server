interface SelectorMapping {
    originalSelector: string;
    healedSelector: string;
    context: {
        before: string;
        after: string;
    };
}
import { BrowserStackConfig } from "../../lib/types.js";
export declare function getSelfHealSelectors(sessionId: string, config: BrowserStackConfig): Promise<SelectorMapping[]>;
export {};
