import { fuzzySearch } from "../../lib/fuzzy";
import { DeviceEntry } from "./start-session";

/**
 * Fuzzy searches App Live device entries by name.
 */
export async function fuzzySearchDevices(
  devices: DeviceEntry[],
  query: string,
  limit: number = 5,
): Promise<DeviceEntry[]> {
  const top_match = await fuzzySearch(
    devices,
    ["device", "display_name"],
    query,
    limit,
  );
  console.error("[fuzzySearchDevices] Top match:", top_match);
  return top_match;
}
