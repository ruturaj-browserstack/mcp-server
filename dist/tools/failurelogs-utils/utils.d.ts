import type { ApiResponse } from "../../lib/apiClient.js";
export interface LogResponse {
    logs?: any[];
    message?: string;
}
export interface HarFile {
    log: {
        entries: HarEntry[];
    };
}
export interface HarEntry {
    startedDateTime: string;
    request: {
        method: string;
        url: string;
        queryString?: {
            name: string;
            value: string;
        }[];
    };
    response: {
        status: number;
        statusText?: string;
        _error?: string;
    };
    serverIPAddress?: string;
    time?: number;
}
export declare function validateLogResponse(response: Response | ApiResponse, logType: string): LogResponse | null;
export declare function filterLinesByKeywords(logText: string, keywords: string[]): string[];
