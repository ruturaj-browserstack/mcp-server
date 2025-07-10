import logger from "../logger.js";
import { execSync } from "child_process";
import { Local } from "browserstack-local";
import config from "../config.js";
async function isBrowserStackLocalRunning() {
    // Check if BrowserStackLocal binary is already running
    try {
        if (process.platform === "win32") {
            const result = execSync('tasklist /FI "IMAGENAME eq BrowserStackLocal.exe"', {
                encoding: "utf8",
            });
            if (result.includes("BrowserStackLocal.exe")) {
                logger.info("BrowserStackLocal binary is already running");
                return true;
            }
        }
        else {
            const result = execSync("pgrep -f BrowserStackLocal", {
                encoding: "utf8",
                stdio: "pipe",
            }).toString();
            if (result) {
                logger.info("BrowserStackLocal binary is already running");
                return true;
            }
        }
        logger.info("BrowserStackLocal binary is not running");
        return false;
    }
    catch (error) {
        logger.info("Error checking BrowserStackLocal status, assuming not running ... " +
            error);
        return false;
    }
}
export async function killExistingBrowserStackLocalProcesses() {
    const isRunning = await isBrowserStackLocalRunning();
    if (!isRunning) {
        return;
    }
    // Check and kill any existing BrowserStackLocal processes before starting new one
    try {
        if (process.platform === "win32") {
            // Check if process exists on Windows
            const checkResult = execSync('tasklist /FI "IMAGENAME eq BrowserStackLocal.exe"', { encoding: "utf8" });
            if (checkResult.includes("BrowserStackLocal.exe")) {
                execSync("taskkill /F /IM BrowserStackLocal.exe", { stdio: "ignore" });
                logger.info("Successfully killed existing BrowserStackLocal processes");
            }
        }
        else {
            // Check if process exists on Unix-like systems
            const checkResult = execSync("pgrep -f BrowserStackLocal", {
                encoding: "utf8",
                stdio: "pipe",
            }).toString();
            if (checkResult) {
                execSync("pkill -f BrowserStackLocal", { stdio: "ignore" });
                logger.info("Successfully killed existing BrowserStackLocal processes");
            }
        }
    }
    catch (error) {
        logger.info(`Error checking/killing BrowserStackLocal processes: ${error}`);
        // Continue execution as there may not be any processes running
    }
}
export async function ensureLocalBinarySetup(username, password, localIdentifier) {
    logger.info("Ensuring local binary setup as it is required for private URLs...");
    if (config.USE_OWN_LOCAL_BINARY_PROCESS) {
        logger.info("Using user's own BrowserStack Local binary process, checking if it's running...");
        const isRunning = await isBrowserStackLocalRunning();
        if (!isRunning) {
            throw new Error("USE_OWN_LOCAL_BINARY_PROCESS is enabled but BrowserStack Local process is not running. Please start your BrowserStack Local binary process first.");
        }
        logger.info("BrowserStack Local process is running, proceeding with user's own process.");
        return;
    }
    const localBinary = new Local();
    await killExistingBrowserStackLocalProcesses();
    // Use a single options object from config and extend with required fields
    const bsLocalArgs = {
        ...(config.browserstackLocalOptions || {}),
        key: password,
        username,
    };
    if (localIdentifier) {
        bsLocalArgs.localIdentifier = localIdentifier;
    }
    return await new Promise((resolve, reject) => {
        localBinary.start(bsLocalArgs, (error) => {
            if (error) {
                logger.error(`Unable to start BrowserStack Local... please check your credentials and try again. Error: ${error}`);
                reject(new Error(`Unable to configure local tunnel binary, please check your credentials and try again. Error: ${error}`));
            }
            else {
                logger.info("Successfully started BrowserStack Local");
                resolve();
            }
        });
    });
}
export function isLocalURL(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        return (hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname.endsWith(".local") ||
            hostname.endsWith(".localhost"));
    }
    catch (error) {
        logger.error(`Error checking if URL is local: ${error}`);
        return false;
    }
}
