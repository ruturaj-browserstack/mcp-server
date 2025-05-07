import fs from "fs";
import os from "os";
import path from "path";

const CACHE_DIR = path.join(os.homedir(), ".browserstack", "combined_cache");
const CACHE_FILE = path.join(CACHE_DIR, "data.json");
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day

const URLS = {
  live: "https://www.browserstack.com/list-of-browsers-and-platforms/live.json",
  app_live:
    "https://www.browserstack.com/list-of-browsers-and-platforms/app_live.json",
};

/**
 * Fetches and caches both BrowserStack datasets (live + app_live) with a shared TTL.
 */
export async function getDevicesAndBrowsers(
  type: "live" | "app_live",
): Promise<any> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  let cache: any = {};

  if (fs.existsSync(CACHE_FILE)) {
    const stats = fs.statSync(CACHE_FILE);
    if (Date.now() - stats.mtimeMs < TTL_MS) {
      try {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        return cache[type];
      } catch (error) {
        console.error("Error parsing cache file:", error);
        // Continue with fetching fresh data
      }
    }
  }

  const [liveRes, appLiveRes] = await Promise.all([
    fetch(URLS.live),
    fetch(URLS.app_live),
  ]);

  if (!liveRes.ok || !appLiveRes.ok) {
    throw new Error(
      `Failed to fetch configuration from BrowserStack for try catch around JSON parse.: live=${liveRes.statusText}, app_live=${appLiveRes.statusText}`,
    );
  }

  const [liveData, appLiveData] = await Promise.all([
    liveRes.json(),
    appLiveRes.json(),
  ]);

  cache = { live: liveData, app_live: appLiveData };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf8");

  return cache[type];
}
