export interface RAGChunk {
    url: string;
    content: string;
}
import { BrowserStackConfig } from "../../lib/types.js";
export interface AccessibilityRAGResponse {
    content: Array<{
        type: "text";
        text: string;
    }>;
}
export declare function queryAccessibilityRAG(userQuery: string, config: BrowserStackConfig): Promise<any>;
