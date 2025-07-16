import { apiClient } from "../../lib/apiClient.js";
export class AccessibilityReportFetcher {
    auth;
    setAuth(auth) {
        this.auth = auth;
    }
    async getReportLink(scanId, scanRunId) {
        // Initiate CSV link generation
        const initUrl = `https://api-accessibility.browserstack.com/api/website-scanner/v1/scans/${scanId}/scan_runs/issues?scan_run_id=${scanRunId}`;
        let basicAuthHeader = undefined;
        if (this.auth) {
            const { username, password } = this.auth;
            basicAuthHeader =
                "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
        }
        const initResp = await apiClient.get({
            url: initUrl,
            headers: basicAuthHeader ? { Authorization: basicAuthHeader } : undefined,
        });
        const initData = initResp.data;
        if (!initData.success) {
            throw new Error(`Failed to initiate report: ${initData.error || initData.data.message}`);
        }
        const taskId = initData.data.task_id;
        // Fetch the generated CSV link
        const reportUrl = `https://api-accessibility.browserstack.com/api/website-scanner/v1/scans/${scanId}/scan_runs/issues?task_id=${encodeURIComponent(taskId)}`;
        // Use apiClient for the report link request as well
        const reportResp = await apiClient.get({
            url: reportUrl,
            headers: basicAuthHeader ? { Authorization: basicAuthHeader } : undefined,
        });
        const reportData = reportResp.data;
        if (!reportData.success) {
            throw new Error(`Failed to fetch report: ${reportData.error}`);
        }
        return reportData.data.reportLink;
    }
}
