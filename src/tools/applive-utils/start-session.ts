import childProcess from "child_process";
import logger from "../../logger";
import { getAppLiveData } from "./device-cache";
import { fuzzySearchDevices } from "./fuzzy-search";
import { sanitizeUrlParam } from "../../lib/utils";
import { uploadApp } from "./upload-app";

export interface DeviceEntry {
  device: string;
  display_name: string;
  os: string;
  os_version: string;
  real_mobile: boolean;
}

interface StartSessionArgs {
  appPath: string;
  desiredPlatform: "android" | "ios";
  desiredPhone: string;
  desiredPlatformVersion: string;
}

/**
 * Starts an App Live session after filtering, fuzzy matching, and launching.
 */
export async function startSession(args: StartSessionArgs): Promise<string> {
  const { appPath, desiredPlatform, desiredPhone } = args;
  let { desiredPlatformVersion } = args;

  const data = await getAppLiveData();
  const allDevices: DeviceEntry[] = data.mobile.flatMap((group: any) =>
    group.devices.map((dev: any) => ({ ...dev, os: group.os })),
  );

  // Exact filter by platform and version
  if (
    desiredPlatformVersion == "latest" ||
    desiredPlatformVersion == "oldest"
  ) {
    const filtered = allDevices.filter((d) => d.os === desiredPlatform);
    filtered.sort((a, b) => {
      const versionA = parseFloat(a.os_version);
      const versionB = parseFloat(b.os_version);
      return desiredPlatformVersion === "latest"
        ? versionB - versionA // descending for "latest"
        : versionA - versionB; // ascending for specific version
    });

    const requiredVersion = filtered[0].os_version;

    desiredPlatformVersion = requiredVersion;
  }
  const filtered = allDevices.filter((d) => {
    if (d.os !== desiredPlatform) return false;

    // Attempt to compare as floats
    try {
      const versionA = parseFloat(d.os_version);
      const versionB = parseFloat(desiredPlatformVersion);
      return versionA === versionB;
    } catch {
      // Fallback to exact string match if parsing fails
      return d.os_version === desiredPlatformVersion;
    }
  });

  // Fuzzy match
  const matches = await fuzzySearchDevices(filtered, desiredPhone);

  if (matches.length === 0) {
    throw new Error(
      `No devices found matching "${desiredPhone}" for ${desiredPlatform} ${desiredPlatformVersion}`,
    );
  }
  const exactMatch = matches.find(
    (d) => d.display_name.toLowerCase() === desiredPhone.toLowerCase(),
  );

  if (exactMatch) {
    matches.splice(0, matches.length, exactMatch); // Replace matches with the exact match
  } else if (matches.length >= 1) {
    const names = matches.map((d) => d.display_name).join(", ");
    const error_message =
      matches.length === 1
        ? `Alternative device found: ${names}. Would you like to use it?`
        : `Multiple devices found: ${names}. Please select one.`;
    throw new Error(`${error_message}`);
  }

  const { app_url } = await uploadApp(appPath);

  if (!app_url.match("bs://")) {
    throw new Error("The app path is not a valid BrowserStack app URL.");
  }

  const device = matches[0];
  const deviceParam = sanitizeUrlParam(
    device.display_name.replace(/\s+/g, "+"),
  );

  const params = new URLSearchParams({
    os: desiredPlatform,
    os_version: desiredPlatformVersion,
    app_hashed_id: app_url.split("bs://").pop() || "",
    scale_to_fit: "true",
    speed: "1",
    start: "true",
  });
  const launchUrl = `https://app-live.browserstack.com/dashboard#${params.toString()}&device=${deviceParam}`;

  try {
    // Use platform-specific commands with proper escaping
    const command =
      process.platform === "darwin"
        ? ["open", launchUrl]
        : process.platform === "win32"
          ? ["cmd", "/c", "start", launchUrl]
          : ["xdg-open", launchUrl];

    // nosemgrep:javascript.lang.security.detect-child-process.detect-child-process
    const child = childProcess.spawn(command[0], command.slice(1), {
      stdio: "ignore",
      detached: true,
    });

    // Handle process errors
    child.on("error", (error) => {
      logger.error(
        `Failed to open browser automatically: ${error}. Please open this URL manually: ${launchUrl}`,
      );
    });

    // Unref the child process to allow the parent to exit
    child.unref();

    return launchUrl;
  } catch (error) {
    logger.error(
      `Failed to open browser automatically: ${error}. Please open this URL manually: ${launchUrl}`,
    );
    return launchUrl;
  }
}
