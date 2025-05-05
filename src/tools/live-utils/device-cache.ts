import fs from "fs";
import os from "os";
import path from "path";

const CACHE_DIR = path.join(os.homedir(), ".browserstack", "live_cache");
const CACHE_FILE = path.join(CACHE_DIR, "live.json");
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day

/**
 * Fetches and caches the Live browsers/platforms JSON with a 1-day TTL.
 */
export async function getLiveData(): Promise<any> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (fs.existsSync(CACHE_FILE)) {
    const stats = fs.statSync(CACHE_FILE);
    if (Date.now() - stats.mtimeMs < TTL_MS) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    }
  }

  const resp = await fetch(
    "https://www.browserstack.com/list-of-browsers-and-platforms/live.json",
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch live list: ${resp.statusText}`);
  }
  const data = await resp.json();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data), "utf8");
  return data;
}
