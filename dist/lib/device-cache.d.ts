export declare enum BrowserStackProducts {
    LIVE = "live",
    APP_LIVE = "app_live",
    APP_AUTOMATE = "app_automate"
}
/**
 * Fetches and caches BrowserStack datasets (live + app_live + app_automate) with a shared TTL.
 */
export declare function getDevicesAndBrowsers(type: BrowserStackProducts): Promise<any>;
