/**
 * ---------- PYTHON INSTRUCTIONS ----------
 */

export const pythonInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy Selenium Python package:
    pip install percy-selenium

---STEP---
Update your Python Selenium script
  - Import the Percy snapshot helper:
    from percy import percy_snapshot
  - In your test, take snapshots like this:
    percy_snapshot(driver, "Your snapshot name")
  
Example:
\`\`\`python
from selenium import webdriver
from percy import percy_snapshot

driver = webdriver.Chrome()
driver.get('http://localhost:8000')
percy_snapshot(driver, 'Home page')
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    npx percy exec -- <your command to run tests>
  
Example output:
  [percy] Percy has started!
  [percy] Created build #1: https://percy.io/your-project
  [percy] Snapshot taken "Home page"
  [percy] Finalized build #1: https://percy.io/your-project
  [percy] Done!

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

export const generatePythonFrameworkInstructions = 
  (framework: string) => (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies for ${framework}
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy Selenium Python package:
    pip install percy-selenium

---STEP---
Update your ${framework} test scripts
  - Import the Percy snapshot helper:
    from percy import percy_snapshot
  - In your ${framework} tests, take snapshots like this:
    percy_snapshot(driver, "Your snapshot name")

---STEP---
Run Percy with your ${framework} tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- ${framework} <path-to-test-files>

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

export const pytestInstructions = generatePythonFrameworkInstructions("pytest");
export const robotInstructions = generatePythonFrameworkInstructions("robot");
export const behaveInstructions = generatePythonFrameworkInstructions("behave");

/**
 * ---------- NODEJS INSTRUCTIONS ----------
 */

export const nodejsInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy SDK for Node.js:
    npm install --save-dev @percy/selenium-js

---STEP---
Update your Node.js Selenium script
  - Import the Percy snapshot helper:
    const { percySnapshot } = require('@percy/selenium-js');
  - In your test, take snapshots like this:
    await percySnapshot(driver, "Your snapshot name");

Example:
\`\`\`javascript
const { Builder } = require('selenium-webdriver');
const { percySnapshot } = require('@percy/selenium-js');

const driver = await new Builder().forBrowser('chrome').build();
await driver.get('http://localhost:8000');
await percySnapshot(driver, 'Home page');
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- <your command to run tests>

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

export const webdriverioInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies for WebDriverIO
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy WebDriverIO package:
    npm install --save-dev @percy/webdriverio

---STEP---
Update your WebDriverIO configuration
  - Add Percy service to your wdio.conf.js:
    services: ['@percy/webdriverio']
  - In your tests, take snapshots like this:
    await browser.percySnapshot('Your snapshot name');

---STEP---
Run Percy with your WebDriverIO tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- npx wdio run

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

export const cypressInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies for Cypress
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy Cypress package:
    npm install --save-dev @percy/cypress

---STEP---
Update your Cypress configuration
  - Add Percy commands to cypress/support/commands.js:
    import '@percy/cypress';
  - In your tests, take snapshots like this:
    cy.percySnapshot('Your snapshot name');

---STEP---
Run Percy with your Cypress tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- npx cypress run

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

/**
 * ---------- JAVA INSTRUCTIONS ----------
 */

export const javaInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies for Java
  - Add Percy Java SDK dependency to your pom.xml:
\`\`\`xml
<dependency>
    <groupId>io.percy</groupId>
    <artifactId>percy-java-selenium</artifactId>
    <version>LATEST</version>
</dependency>
\`\`\`

  - For Gradle projects, add to build.gradle:
\`\`\`groovy
dependencies {
    implementation 'io.percy:percy-java-selenium:LATEST'
}
\`\`\`

---STEP---
Update your Java Selenium test
  - Import the Percy snapshot helper:
    import io.percy.selenium.Percy;
  - Initialize Percy in your test:
    Percy percy = new Percy(driver);
  - Take snapshots like this:
    percy.snapshot("Your snapshot name");

Example:
\`\`\`java
import io.percy.selenium.Percy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class ExampleTest {
    public void test() {
        WebDriver driver = new ChromeDriver();
        Percy percy = new Percy(driver);
        
        driver.get("http://localhost:8000");
        percy.snapshot("Home page");
    }
}
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} mvn test

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

/**
 * ---------- C# INSTRUCTIONS ----------
 */

export const csharpInstructions = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}

---STEP---
Install Percy dependencies for C#
  - Install Percy .NET package via NuGet:
    Install-Package Percy.Selenium
  - Or via .NET CLI:
    dotnet add package Percy.Selenium

---STEP---
Update your C# Selenium test
  - Import the Percy namespace:
    using Percy.Selenium;
  - Initialize Percy in your test:
    var percy = new Percy(driver);
  - Take snapshots like this:
    percy.Snapshot("Your snapshot name");

Example:
\`\`\`csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Percy.Selenium;

public class ExampleTest 
{
    public void Test() 
    {
        IWebDriver driver = new ChromeDriver();
        var percy = new Percy(driver);
        
        driver.Navigate().GoToUrl("http://localhost:8000");
        percy.Snapshot("Home page");
    }
}
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} dotnet test

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;
