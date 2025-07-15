import type { ApiResponse } from "./apiClient.js";
export declare function sanitizeUrlParam(param: string): string;
export declare function maybeCompressBase64(base64: string): Promise<string>;
export declare function assertOkResponse(response: Response | ApiResponse, action: string): Promise<void>;
