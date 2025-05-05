// File: src/tools/live-utils/start-session.ts
import { sanitizeUrlParam } from "../../lib/utils";
import logger from "../../logger";
import childProcess from "child_process";
import { getLiveData } from "./device-cache";
import { resolveVersion } from "./version-resolver";
import { customFuzzySearch } from "../../lib/fuzzy";

export interface DesktopArgs {
  platformType: "desktop";
  url: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  isLocal: boolean;
}
export interface MobileArgs {
  platformType: "mobile";
  url: string;
  os: string;
  osVersion: string;
  device: string;
  browser: string;
  isLocal: boolean;
}

/**
 * Entrypoint: detects platformType & delegates.
 */
export async function startBrowserSession(
  args: DesktopArgs | MobileArgs,
): Promise<string> {
  if (args.platformType === "desktop") {
    const entry = await filterDesktop(args);
    const url = buildDesktopUrl(args, entry);
    openBrowser(url);
    if (entry.notes) {
      return `${url}, ${entry.notes}`;
    }
    return url;
  } else {
    const entry = await filterMobile(args);
    const url = buildMobileUrl(args, entry);
    openBrowser(url);
    if (entry.notes) {
      return `${url}, ${entry.notes}`;
    }
    return url;
  }
}

// ——— Desktop ———

interface DesktopEntry {
  os: string;
  os_version: string;
  browser: string;
  browser_version: string;
  notes?: string;
}

async function filterDesktop(args: DesktopArgs): Promise<DesktopEntry> {
  const data = await getLiveData();
  const all: DesktopEntry[] = data.desktop.flatMap((plat: any) =>
    plat.browsers.map((b: any) => ({
      os: plat.os,
      os_version: plat.os_version,
      browser: b.browser,
      browser_version: b.browser_version,
    })),
  );

  let entries = all.filter((e) => e.os === args.os);
  if (!entries.length) throw new Error(`No OS entries for "${args.os}".`);

  entries = entries.filter((e) => e.browser === args.browser);
  if (!entries.length)
    throw new Error(`No browser "${args.browser}" on ${args.os}.`);

  const uniqueVers = Array.from(new Set(entries.map((e) => e.os_version)));

  let chosenOS: string;
  if (args.os === "OS X") {
    // macOS named versions: fuzzy match or pick first/last in JSON order
    if (args.osVersion === "latest") {
      chosenOS = uniqueVers[uniqueVers.length - 1];
    } else if (args.osVersion === "oldest") {
      chosenOS = uniqueVers[0];
    } else {
      // try fuzzy
      const fuzzy = customFuzzySearch(
        uniqueVers.map((v) => ({ os_version: v })),
        ["os_version"],
        args.osVersion,
        1,
      );
      chosenOS = fuzzy.length ? fuzzy[0].os_version : args.osVersion;
    }
    // fallback if still not valid
    if (!uniqueVers.includes(chosenOS)) {
      chosenOS = uniqueVers[0];
    }
  } else {
    // numeric/semantic resolve for Windows
    chosenOS = resolveVersion(args.osVersion, uniqueVers);
  }
  entries = entries.filter((e) => e.os_version === chosenOS);
  // resolve browser version
  const browVers = entries.map((e) => e.browser_version);
  const chosenBrow = resolveVersion(args.browserVersion, browVers);
  const final = entries.find((e) => e.browser_version === chosenBrow);
  if (!final)
    throw new Error(`No entry for browser version "${args.browserVersion}".`);

  if (
    args.osVersion !== chosenOS &&
    args.osVersion !== "latest" &&
    args.osVersion !== "oldest"
  ) {
    final.notes = `Note: Os version ${args.osVersion} was not found. Using "${chosenOS}" instead.`;
  }
  if (
    args.browserVersion !== chosenBrow &&
    args.browserVersion !== "latest" &&
    args.browserVersion !== "oldest"
  ) {
    if (!final.notes) {
      final.notes = `Note: `;
    }
    final.notes += `Browser version ${args.browserVersion} was not found. Using "${chosenBrow}" instead.`;
  }

  return final;
}

function buildDesktopUrl(args: DesktopArgs, e: DesktopEntry): string {
  const params = new URLSearchParams({
    os: sanitizeUrlParam(e.os),
    os_version: sanitizeUrlParam(e.os_version),
    browser: sanitizeUrlParam(e.browser),
    browser_version: sanitizeUrlParam(e.browser_version),
    url: sanitizeUrlParam(args.url),
    scale_to_fit: "true",
    resolution: "responsive-mode",
    speed: "1",
    local: args.isLocal ? "true" : "false",
    start: "true",
  });
  return `https://live.browserstack.com/dashboard#${params.toString()}`;
}

// ——— Mobile ———

interface MobileEntry {
  os: string;
  os_version: string;
  display_name: string;
  notes?: string;
}

async function filterMobile(args: MobileArgs): Promise<MobileEntry> {
  const data = await getLiveData();
  const all: MobileEntry[] = data.mobile.flatMap((grp: any) =>
    grp.devices.map((d: any) => ({
      os: grp.os,
      os_version: d.os_version,
      display_name: d.display_name,
      notes: "",
    })),
  );

  let candidates = all.filter((d) => d.os === args.os);
  if (!candidates.length)
    throw new Error(`No mobile OS entries for "${args.os}".`);

  // fuzzy‐match device name
  const matches = customFuzzySearch(
    candidates,
    ["display_name"],
    args.device,
    5,
  );
  if (!matches.length)
    throw new Error(`No devices matching "${args.device}" on ${args.os}.`);

  const exact = matches.find(
    (m) => m.display_name.toLowerCase() === args.device.toLowerCase(),
  );
  if (!exact) {
    const names = matches.map((m) => m.display_name).join(", ");
    throw new Error(
      `Alternative Device/Device's found : ${names}. Please Select one.`,
    );
  }
  candidates = candidates.filter((d) => d.display_name === exact.display_name);
  if (!candidates.length)
    throw new Error(`No device "${exact.display_name}" on ${args.os}.`);
  // resolve browser versio

  // resolve OS version
  const vers = candidates.map((d) => d.os_version);
  const chosen = resolveVersion(args.osVersion, vers);
  candidates = candidates.filter((d) => d.os_version === chosen);

  if (!candidates.length)
    throw new Error(`No entry for OS version "${args.osVersion}".`);

  let notes = "";
  if (
    chosen !== args.osVersion &&
    args.osVersion !== "latest" &&
    args.osVersion !== "oldest"
  ) {
    notes = `Note: Os version ${args.osVersion} was not found. Using ${chosen} instead.`;
  }

  const final = candidates[0];
  if (!final) throw new Error(`No entry for OS version "${args.osVersion}".`);
  final.notes = notes;
  return final;
}

function buildMobileUrl(args: MobileArgs, d: MobileEntry): string {
  const os_map = {
    android: "Android",
    ios: "iOS",
    winphone: "Winphone",
  };
  const os = os_map[d.os as keyof typeof os_map] || d.os;

  const params = new URLSearchParams({
    os: sanitizeUrlParam(os),
    os_version: sanitizeUrlParam(d.os_version),
    device: d.display_name,
    device_browser: sanitizeUrlParam(args.browser),
    url: sanitizeUrlParam(args.url),
    scale_to_fit: "true",
    speed: "1",
    start: "true",
  });
  return `https://live.browserstack.com/dashboard#${params.toString()}`;
}

// ——— Open a browser window ———

function openBrowser(launchUrl: string): void {
  try {
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
    child.on("error", (err) =>
      logger.error(`Failed to open browser: ${err}. URL: ${launchUrl}`),
    );
    child.unref();
  } catch (err) {
    logger.error(`Failed to launch browser: ${err}. URL: ${launchUrl}`);
  }
}
