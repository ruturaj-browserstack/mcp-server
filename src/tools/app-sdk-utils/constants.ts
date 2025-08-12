// Common Gradle setup instructions for App Automate (platform-independent)
export const GRADLE_APP_SETUP_INSTRUCTIONS = `
**For Gradle setup:**
1. Add browserstack-java-sdk to dependencies:
   compileOnly 'com.browserstack:browserstack-java-sdk:latest.release'

2. Add browserstackSDK path variable:
   def browserstackSDKArtifact = configurations.compileClasspath.resolvedConfiguration.resolvedArtifacts.find { it.name == 'browserstack-java-sdk' }

3. Add javaagent to gradle tasks:
   jvmArgs "-javaagent:\${browserstackSDKArtifact.file}"
`;

/**
 * Maven archetype constants for App Automate
 */
export const MAVEN_ARCHETYPE_GROUP_ID = "com.browserstack";
export const MAVEN_ARCHETYPE_VERSION = "1.0";

/**
 * Returns the Maven command for Windows for App Automate SDK setup
 */
export function getMavenCommandForWindows(
  mavenFramework: string,
  framework: string,
  username: string,
  accessKey: string
): string {
  return (
    `mvn archetype:generate -B ` +
    `-DarchetypeGroupId="${MAVEN_ARCHETYPE_GROUP_ID}" ` +
    `-DarchetypeArtifactId="${mavenFramework}" ` +
    `-DarchetypeVersion="${MAVEN_ARCHETYPE_VERSION}" ` +
    `-DgroupId="${MAVEN_ARCHETYPE_GROUP_ID}" ` +
    `-DartifactId="${mavenFramework}" ` +
    `-Dversion="${MAVEN_ARCHETYPE_VERSION}" ` +
    `-DBROWSERSTACK_USERNAME="${username}" ` +
    `-DBROWSERSTACK_ACCESS_KEY="${accessKey}" ` +
    `-DBROWSERSTACK_FRAMEWORK="${framework}"`
  );
}

/**
 * Returns the Maven command for macOS/Linux for App Automate SDK setup
 */
export function getMavenCommandForUnix(
  mavenFramework: string,
  framework: string,
  username: string,
  accessKey: string
): string {
  return (
    `mvn archetype:generate -B \\\n` +
    `-DarchetypeGroupId=${MAVEN_ARCHETYPE_GROUP_ID} \\\n` +
    `-DarchetypeArtifactId=${mavenFramework} -DarchetypeVersion=${MAVEN_ARCHETYPE_VERSION} \\\n` +
    `-DgroupId=${MAVEN_ARCHETYPE_GROUP_ID} -DartifactId=${mavenFramework} -Dversion=${MAVEN_ARCHETYPE_VERSION} \\\n` +
    `-DBROWSERSTACK_USERNAME="${username}" \\\n` +
    `-DBROWSERSTACK_ACCESS_KEY="${accessKey}" \\\n` +
    `-DBROWSERSTACK_FRAMEWORK="${framework}"`
  );
}

/**
 * Utility to generate the Maven command for App Automate SDK setup (platform-aware)
 */
export function getMavenAppAutomateCommand(
  mavenFramework: string,
  framework: string,
  username: string,
  accessKey: string
): string {
  const isWindows = process.platform === "win32";
  if (isWindows) {
    return getMavenCommandForWindows(mavenFramework, framework, username, accessKey);
  } else {
    return getMavenCommandForUnix(mavenFramework, framework, username, accessKey);
  }
}
