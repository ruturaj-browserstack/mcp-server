type SimplifiedAccessibilityIssue = {
    issue_type: string;
    component: string;
    issue_description: string;
    HTML_snippet: string;
    how_to_fix: string;
    severity: string;
};
type PaginationOptions = {
    /** How many JSON-chars max per “page” (default 10000) */
    maxCharacterLength?: number;
    /** Character offset to start from (default 0) */
    nextPage?: number;
};
type PaginatedResult = {
    records: SimplifiedAccessibilityIssue[];
    /** Character offset for the next page, or null if done */
    page_length: number;
    total_issues: number;
    next_page: number | null;
};
export declare function parseAccessibilityReportFromCSV(reportLink: string, { maxCharacterLength, nextPage }?: PaginationOptions): Promise<PaginatedResult>;
export {};
