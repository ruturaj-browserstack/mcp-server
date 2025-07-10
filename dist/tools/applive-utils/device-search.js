import { customFuzzySearch } from "../../lib/fuzzy.js";
/**
 * Find matching devices by name with exact match preference.
 * Throws if none or multiple exact matches.
 */
export function findDeviceByName(devices, desiredPhone) {
    const matches = customFuzzySearch(devices, ["display_name"], desiredPhone, 5);
    if (matches.length === 0) {
        const options = [...new Set(devices.map((d) => d.display_name))].join(", ");
        throw new Error(`No devices matching "${desiredPhone}". Available devices: ${options}`);
    }
    // Exact-case-insensitive filter
    const exact = matches.filter((m) => m.display_name.toLowerCase() === desiredPhone.toLowerCase());
    if (exact.length)
        return exact;
    // If no exact but multiple fuzzy, ask user
    if (matches.length > 1) {
        const names = matches.map((d) => d.display_name).join(", ");
        throw new Error(`Alternative Device/Device's found : ${names}. Please Select one.`);
    }
    return matches;
}
