import { apiClient } from "../../lib/apiClient.js";
import { parse } from "csv-parse/sync";
export async function parseAccessibilityReportFromCSV(reportLink, { maxCharacterLength = 5000, nextPage = 0 } = {}) {
    // 1) Download & parse
    const res = await apiClient.get({ url: reportLink });
    if (!res.ok)
        throw new Error(`Failed to download report: ${res.statusText}`);
    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    const all = parse(text, {
        columns: true,
        skip_empty_lines: true,
    }).map((row) => ({
        issue_type: row["Issue type"],
        component: row["Component"],
        issue_description: row["Issue description"],
        HTML_snippet: row["HTML snippet"],
        how_to_fix: row["How to fix this issue"],
        severity: (row["Severity"] || "unknown").trim(),
    }));
    const totalIssues = all.length;
    // 2) Sort by severity
    const order = {
        critical: 0,
        serious: 1,
        moderate: 2,
        minor: 3,
    };
    all.sort((a, b) => (order[a.severity] ?? 99) - (order[b.severity] ?? 99));
    // 3) Walk to the starting offset
    let charCursor = 0;
    let idx = 0;
    for (; idx < all.length; idx++) {
        const len = JSON.stringify(all[idx]).length;
        if (charCursor + len > nextPage)
            break;
        charCursor += len;
    }
    // 4) Collect up to maxCharacterLength
    const page = [];
    for (let i = idx; i < all.length; i++) {
        const recStr = JSON.stringify(all[i]);
        if (charCursor - nextPage + recStr.length > maxCharacterLength)
            break;
        page.push(all[i]);
        charCursor += recStr.length;
    }
    const pageLength = page.length;
    const hasMore = idx + pageLength < totalIssues;
    return {
        records: page,
        next_page: hasMore ? charCursor : null,
        page_length: pageLength,
        total_issues: totalIssues,
    };
}
