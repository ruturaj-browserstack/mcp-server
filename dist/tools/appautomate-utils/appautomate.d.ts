import { BrowserStackConfig } from "../../lib/types.js";
interface Device {
    device: string;
    display_name: string;
    os_version: string;
    real_mobile: boolean;
}
/**
 * Finds devices that exactly match the provided display name.
 * Uses fuzzy search first, and then filters for exact case-insensitive match.
 */
export declare function findMatchingDevice(devices: Device[], deviceName: string): Device[];
/**
 * Extracts all unique OS versions from a device list and sorts them.
 */
export declare function getDeviceVersions(devices: Device[]): string[];
/**
 * Resolves the requested platform version against available versions.
 * Supports 'latest' and 'oldest' as dynamic selectors.
 */
export declare function resolveVersion(versions: string[], requestedVersion: string): string;
/**
 * Validates the input arguments for taking app screenshots.
 * Checks for presence and correctness of platform, device, and file types.
 */
export declare function validateArgs(args: {
    desiredPlatform: string;
    desiredPlatformVersion: string;
    appPath: string;
    desiredPhone: string;
}): void;
/**
 * Uploads an application file to AppAutomate and returns the app URL
 */
export declare function uploadApp(appPath: string, username: string, password: string): Promise<string>;
export declare function uploadEspressoApp(appPath: string, config: BrowserStackConfig): Promise<string>;
export declare function uploadEspressoTestSuite(testSuitePath: string, config: BrowserStackConfig): Promise<string>;
export declare function uploadXcuiApp(appPath: string, config: BrowserStackConfig): Promise<string>;
export declare function uploadXcuiTestSuite(testSuitePath: string, config: BrowserStackConfig): Promise<string>;
export declare function triggerEspressoBuild(app_url: string, test_suite_url: string, devices: string[], project: string): Promise<string>;
export declare function triggerXcuiBuild(app_url: string, test_suite_url: string, devices: string[], project: string, config: BrowserStackConfig): Promise<string>;
export {};
