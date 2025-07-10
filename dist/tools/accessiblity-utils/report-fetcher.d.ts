export declare class AccessibilityReportFetcher {
    private auth;
    setAuth(auth: {
        username: string;
        password: string;
    }): void;
    getReportLink(scanId: string, scanRunId: string): Promise<string>;
}
