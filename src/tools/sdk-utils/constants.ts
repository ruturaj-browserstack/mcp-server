import { ConfigMapping } from "./types.js";
import config from "../../config.js";

const nodejsInstructions = `
- Ensure that \`browserstack-node-sdk\` is present in package.json, use the latest version.
- Add new scripts to package.json for running tests on BrowserStack (use \`npx\` to trigger the sdk):
  \`\`\`json
  "scripts": {
    "test:browserstack": "npx browserstack-node-sdk <framework-specific-test-execution-command>"
  }
  \`\`\`
- Add to dependencies:
  \`\`\`json
  "browserstack-node-sdk": "latest"
  \`\`\`
- Inform user to export BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY as environment variables.
`;

const pythonInstructions = `
Run the following command to install the browserstack-sdk:
\`\`\`bash
python3 -m pip install browserstack-sdk
\`\`\`

Run the following command to setup the browserstack-sdk:
\`\`\`bash
browserstack-sdk setup --username "${config.browserstackUsername}" --key "${config.browserstackAccessKey}"
\`\`\`

In order to run tests on BrowserStack, run the following command:
\`\`\`bash
browserstack-sdk python <path-to-test-file>
\`\`\`
`;


const javaInstructions = `
Add the following dependency to your pom.xml:
\`\`\`xml
<dependency>
    <groupId>com.browserstack</groupId>
    <artifactId>browserstack-java-sdk</artifactId>
    <version>LATEST</version>
    <scope>compile</scope>
</dependency>
\`\`\`

For Gradle projects, add to build.gradle:
\`\`\`groovy
dependencies {
    implementation 'com.browserstack:browserstack-java-sdk:LATEST'
}
\`\`\`

Inform user to export BROWSERSTACK_USERNAME=${config.browserstackUsername} and 
BROWSERSTACK_ACCESS_KEY=${config.browserstackAccessKey} as environment variables.

Run tests using:
\`\`\`bash
mvn clean test 
\`\`\`

Or for Gradle:
\`\`\`bash
gradle clean test
\`\`\`
`;

export const SUPPORTED_CONFIGURATIONS: ConfigMapping = {
  nodejs: {
    playwright: {
      jest: { instructions: nodejsInstructions },
      codeceptjs: { instructions: nodejsInstructions },
      playwright: { instructions: nodejsInstructions },
    },
    selenium: {
      jest: { instructions: nodejsInstructions },
      webdriverio: { instructions: nodejsInstructions },
      mocha: { instructions: nodejsInstructions },
      cucumber: { instructions: nodejsInstructions },
      nightwatch: { instructions: nodejsInstructions },
      codeceptjs: { instructions: nodejsInstructions },
    },
  },
  python: {
    playwright: {
      pytest: { instructions: pythonInstructions },
    },
    selenium: {
      pytest: { instructions: pythonInstructions },
      robot: { instructions: pythonInstructions },
      behave: { instructions: pythonInstructions },
    },
  },
  java: {
    playwright: {},
    selenium: {
      testng: { instructions: javaInstructions },
      cucumber: { instructions: javaInstructions },
      junit: { instructions: javaInstructions },
    },
  },
};
