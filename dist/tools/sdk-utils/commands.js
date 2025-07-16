// Framework mapping for Java Maven archetype generation
const JAVA_FRAMEWORK_MAP = {
    testng: "testng",
    junit5: "junit5",
    junit4: "junit4",
    cucumber: "cucumber-testng",
};
// Common Gradle setup instructions (platform-independent)
const GRADLE_SETUP_INSTRUCTIONS = `
**For Gradle setup:**
1. Add browserstack-java-sdk to dependencies:
   compileOnly 'com.browserstack:browserstack-java-sdk:latest.release'

2. Add browserstackSDK path variable:
   def browserstackSDKArtifact = configurations.compileClasspath.resolvedConfiguration.resolvedArtifacts.find { it.name == 'browserstack-java-sdk' }

3. Add javaagent to gradle tasks:
   jvmArgs "-javaagent:\${browserstackSDKArtifact.file}"
`;
export function getSDKPrefixCommand(language, framework, username, accessKey) {
    switch (language) {
        case "nodejs":
            return `---STEP---
Install BrowserStack Node SDK using command:
\`\`\`bash
npm i -D browserstack-node-sdk@latest
\`\`\`
---STEP---
Run the following command to setup browserstack sdk:
\`\`\`bash
npx setup --username ${username} --key ${accessKey}
\`\`\`
---STEP---
Edit the browserstack.yml file that was created in the project root to add your desired platforms and browsers.`;
        case "java": {
            const mavenFramework = getJavaFrameworkForMaven(framework);
            const isWindows = process.platform === "win32";
            const mavenCommand = isWindows
                ? `mvn archetype:generate -B -DarchetypeGroupId="com.browserstack" -DarchetypeArtifactId="browserstack-sdk-archetype-integrate" -DarchetypeVersion="1.0" -DgroupId="com.browserstack" -DartifactId="browserstack-sdk-archetype-integrate" -Dversion="1.0" -DBROWSERSTACK_USERNAME="${process.env.BROWSERSTACK_USERNAME}" -DBROWSERSTACK_ACCESS_KEY="${process.env.BROWSERSTACK_ACCESS_KEY}" -DBROWSERSTACK_FRAMEWORK="${mavenFramework}"`
                : `mvn archetype:generate -B -DarchetypeGroupId=com.browserstack \\
-DarchetypeArtifactId=browserstack-sdk-archetype-integrate -DarchetypeVersion=1.0 \\
-DgroupId=com.browserstack -DartifactId=browserstack-sdk-archetype-integrate -Dversion=1.0 \\
-DBROWSERSTACK_USERNAME="${username}" \\
-DBROWSERSTACK_ACCESS_KEY="${accessKey}" \\
-DBROWSERSTACK_FRAMEWORK="${mavenFramework}"`;
            const platformLabel = isWindows ? "Windows" : "macOS/Linux";
            return `---STEP---
Install BrowserStack Java SDK

**Maven command for ${framework} (${platformLabel}):**
Run the command, it is required to generate the browserstack-sdk-archetype-integrate project:
${mavenCommand}

Alternative setup for Gradle users:
${GRADLE_SETUP_INSTRUCTIONS}`;
        }
        // Add more languages as needed
        default:
            return "";
    }
}
export function getJavaFrameworkForMaven(framework) {
    return JAVA_FRAMEWORK_MAP[framework] || framework;
}
