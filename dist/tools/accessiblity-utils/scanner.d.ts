export interface AccessibilityScanResponse {
    success: boolean;
    data?: {
        id: string;
        scanRunId: string;
    };
    errors?: string[];
}
export interface AccessibilityScanStatus {
    success: boolean;
    data?: {
        status: string;
    };
    errors?: string[];
}
export declare class AccessibilityScanner {
    private auth;
    setAuth(auth: {
        username: string;
        password: string;
    }): void;
    startScan(name: string, urlList: string[]): Promise<AccessibilityScanResponse>;
    pollStatus(scanId: string, scanRunId: string): Promise<AccessibilityScanStatus>;
    waitUntilComplete(scanId: string, scanRunId: string, context: any): Promise<string>;
}
