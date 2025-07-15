import { resolveVersion } from "../../lib/version-resolver.js";
/**
 * Resolve desired version against available list
 */
export function pickVersion(available, requested) {
    try {
        return resolveVersion(requested, available);
    }
    catch {
        const opts = available.join(", ");
        throw new Error(`Version "${requested}" not found. Available versions: ${opts}`);
    }
}
