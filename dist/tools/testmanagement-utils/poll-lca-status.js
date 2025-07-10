import { apiClient } from "../../lib/apiClient.js";
import { getBrowserStackAuth } from "../../lib/get-auth.js";
/**
 * Poll test case details to check LCA build status
 */
export async function pollLCAStatus(projectId, folderId, testCaseId, context, maxWaitTimeMs = 10 * 60 * 1000, // 10 minutes default
initialWaitMs = 2 * 60 * 1000, // 2 minutes initial wait
pollIntervalMs = 10 * 1000, // 10 seconds interval
config) {
    const url = `https://test-management.browserstack.com/api/v1/projects/${projectId}/folder/${folderId}/test-cases/${testCaseId}`;
    const startTime = Date.now();
    // Send initial notification that polling is starting
    const notificationInterval = Math.min(initialWaitMs, pollIntervalMs);
    const notificationStartTime = Date.now();
    const notificationIntervalId = setInterval(async () => {
        const elapsedTime = Date.now() - notificationStartTime;
        const progressPercentage = Math.min(90, Math.floor((elapsedTime / maxWaitTimeMs) * 90));
        await context.sendNotification({
            method: "notifications/progress",
            params: {
                progressToken: context._meta?.progressToken ?? `lca-${testCaseId}`,
                message: `Generating Low Code Automation Test..`,
                progress: progressPercentage,
                total: 100,
            },
        });
        if (elapsedTime >= initialWaitMs) {
            clearInterval(notificationIntervalId);
        }
    }, notificationInterval);
    // Wait for initial period before starting to poll
    await new Promise((resolve) => setTimeout(resolve, initialWaitMs));
    clearInterval(notificationIntervalId);
    return new Promise((resolve) => {
        // Set up timeout to handle max wait time
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            // Send timeout notification
            context.sendNotification({
                method: "notifications/progress",
                params: {
                    progressToken: context._meta?.progressToken ?? `lca-${testCaseId}`,
                    message: `LCA build polling timed out after ${Math.floor(maxWaitTimeMs / 60000)} minutes`,
                    progress: 100,
                    total: 100,
                },
            });
            resolve(null);
        }, maxWaitTimeMs);
        // Set up polling interval
        const intervalId = setInterval(async () => {
            try {
                const authString = getBrowserStackAuth(config);
                const response = await apiClient.get({
                    url,
                    headers: {
                        "API-TOKEN": authString,
                        accept: "application/json, text/plain, */*",
                    },
                });
                const responseData = response.data;
                if (responseData.data.success && responseData.data.test_case) {
                    const testCase = responseData.data.test_case;
                    // Check lcnc_build_map in both possible locations
                    const lcncBuildMap = testCase.lcnc_build_map ||
                        responseData.data.metadata?.lcnc_build_map;
                    if (lcncBuildMap) {
                        if (lcncBuildMap.status === "done") {
                            // Clean up timers
                            clearInterval(intervalId);
                            clearTimeout(timeoutId);
                            // Send completion notification
                            await context.sendNotification({
                                method: "notifications/progress",
                                params: {
                                    progressToken: context._meta?.progressToken ?? `lca-${testCaseId}`,
                                    message: `LCA build completed successfully!`,
                                    progress: 100,
                                    total: 100,
                                },
                            });
                            resolve({
                                resource_path: lcncBuildMap.resource_path,
                                status: lcncBuildMap.status,
                            });
                            return;
                        }
                        // Send progress notification with current status
                        const elapsedTime = Date.now() - startTime;
                        const progressPercentage = Math.min(90, Math.floor((elapsedTime / maxWaitTimeMs) * 90) + 10);
                        // Cycle through different numbers of dots (2, 3, 4, 5, then back to 2)
                        const dotCount = (Math.floor(elapsedTime / pollIntervalMs) % 4) + 2;
                        const dots = ".".repeat(dotCount);
                        await context.sendNotification({
                            method: "notifications/progress",
                            params: {
                                progressToken: context._meta?.progressToken ?? `lca-${testCaseId}`,
                                message: `Generating Low Code Automation Test${dots}`,
                                progress: progressPercentage,
                                total: 100,
                            },
                        });
                    }
                }
            }
            catch (error) {
                console.error("Error polling LCA status:", error);
                // Send error notification but continue polling
                await context.sendNotification({
                    method: "notifications/progress",
                    params: {
                        progressToken: context._meta?.progressToken ?? `lca-${testCaseId}`,
                        message: `Error occurred while polling, retrying... (${error instanceof Error ? error.message : "Unknown error"})`,
                        progress: Math.min(90, Math.floor(((Date.now() - startTime) / maxWaitTimeMs) * 90) + 10),
                        total: 100,
                    },
                });
            }
        }, pollIntervalMs);
    });
}
