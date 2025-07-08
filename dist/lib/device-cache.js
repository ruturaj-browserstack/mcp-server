import fs from "fs";
import os from "os";
import path from "path";
import { apiClient } from "./apiClient.js";
const CACHE_DIR = path.join(os.homedir(), ".browserstack", "combined_cache");
const CACHE_FILE = path.join(CACHE_DIR, "data.json");
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day
export var BrowserStackProducts;
(function (BrowserStackProducts) {
    BrowserStackProducts["LIVE"] = "live";
    BrowserStackProducts["APP_LIVE"] = "app_live";
    BrowserStackProducts["APP_AUTOMATE"] = "app_automate";
})(BrowserStackProducts || (BrowserStackProducts = {}));
const URLS = {
    [BrowserStackProducts.LIVE]: "https://www.browserstack.com/list-of-browsers-and-platforms/live.json",
    [BrowserStackProducts.APP_LIVE]: "https://www.browserstack.com/list-of-browsers-and-platforms/app_live.json",
    [BrowserStackProducts.APP_AUTOMATE]: "https://www.browserstack.com/list-of-browsers-and-platforms/app_automate.json",
};
/**
 * Fetches and caches BrowserStack datasets (live + app_live + app_automate) with a shared TTL.
 */
export async function getDevicesAndBrowsers(type) {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        const stats = fs.statSync(CACHE_FILE);
        if (Date.now() - stats.mtimeMs < TTL_MS) {
            try {
                cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
                if (cache[type]) {
                    return cache[type];
                }
            }
            catch (error) {
                console.error("Error parsing cache file:", error);
                // Continue with fetching fresh data
            }
        }
    }
    const liveRes = await apiClient.get({ url: URLS[type] });
    if (!liveRes.ok) {
        throw new Error(`Failed to fetch configuration from BrowserStack : ${type}=${liveRes.statusText}`);
    }
    cache = {
        [type]: liveRes,
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf8");
    return cache[type];
}
