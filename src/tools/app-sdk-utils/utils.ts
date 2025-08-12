export function getSetBrowserStackCredentialsStep(username: string, accessKey: string): string {
  const isWindows = process.platform === "win32";
  const platformLabel = isWindows ? "Windows" : "macOS/Linux";

  const commands = isWindows
    ? [
        `set BROWSERSTACK_USERNAME=${username}`,
        `set BROWSERSTACK_ACCESS_KEY=${accessKey}`,
      ].join("\n")
    : [
        `export BROWSERSTACK_USERNAME="${username}"`,
        `export BROWSERSTACK_ACCESS_KEY="${accessKey}"`,
      ].join("\n");

  const codeBlockLang = isWindows ? "cmd" : "bash";

  return `---STEP---
Set BrowserStack credentials as environment variables:

${platformLabel}
----------------

\`\`\`${codeBlockLang}
${commands}
\`\`\`
`;
}
