import { DeviceEntry } from "./types.js";
/**
 * Find matching devices by name with exact match preference.
 * Throws if none or multiple exact matches.
 */
export declare function findDeviceByName(devices: DeviceEntry[], desiredPhone: string): DeviceEntry[];
