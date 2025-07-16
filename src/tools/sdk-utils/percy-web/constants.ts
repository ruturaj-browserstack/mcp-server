/**
 * Shared Percy steps for all languages
 */
export const percySetTokenStep = (percyToken: string) => `
---STEP---
Set the Percy token as an environment variable
  - For macOS/Linux:
    export PERCY_TOKEN="${percyToken}"
  - For Windows PowerShell:
    setx PERCY_TOKEN "${percyToken}"
  - For Windows CMD:
    set PERCY_TOKEN=${percyToken}
`;

export const percyReviewSnapshotsStep = `
---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

/**
 * ---------- PYTHON INSTRUCTIONS ----------
 */

export const pythonInstructions = (percyToken: string) => `
${percySetTokenStep(percyToken)}
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

${percyReviewSnapshotsStep}
`;

/**
 * ---------- NODEJS INSTRUCTIONS ----------
 */

export const nodejsInstructions = (percyToken: string) => `
${percySetTokenStep(percyToken)}
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

/**
 * ---------- JAVA INSTRUCTIONS ----------
 */

export const javaInstructions = (percyToken: string) => `
${percySetTokenStep(percyToken)}
---STEP---
Add Percy dependencies to your project
  - For Maven, add to your pom.xml:
    <dependency>
      <groupId>io.percy</groupId>
      <artifactId>percy-java-selenium</artifactId>
      <version>1.0.0</version>
    </dependency>
  - For Gradle, add to your build.gradle:
    implementation 'io.percy:percy-java-selenium:1.0.0'

---STEP---
Update your Java Selenium test
  - Import the Percy snapshot helper:
    import io.percy.selenium.Percy;
  - In your test, take snapshots like this:
    Percy percy = new Percy(driver);
    percy.snapshot("Your snapshot name");

Example:
\`\`\`java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.percy.selenium.Percy;

public class PercyExample {
  public static void main(String[] args) {
    WebDriver driver = new ChromeDriver();
    driver.get("http://localhost:8000");
    Percy percy = new Percy(driver);
    percy.snapshot("Home page");
    driver.quit();
  }
}
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- <your command to run tests>

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

/**
 * ---------- RUBY INSTRUCTIONS ----------
 */

export const rubyInstructions = (percyToken: string) => `
${percySetTokenStep(percyToken)}
---STEP---
Install Percy dependencies
  - Install Percy CLI:
    npm install --save-dev @percy/cli
  - Install Percy Ruby Selenium gem:
    gem install percy-selenium

---STEP---
Update your Ruby Selenium test
  - Require the Percy snapshot helper:
    require 'percy'
  - In your test, take snapshots like this:
    Percy.snapshot(page, 'Your snapshot name')

Example:
\`\`\`ruby
require 'selenium-webdriver'
require 'percy'

driver = Selenium::WebDriver.for :chrome
driver.get('http://localhost:8000')
Percy.snapshot(driver, 'Home page')
driver.quit
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    npx percy exec -- <your command to run tests>

---STEP---
Review the snapshots
  - Go to your Percy project on https://percy.io to review snapshots and approve/reject any visual changes.
`;

/**
 * ---------- CSHARP INSTRUCTIONS ----------
 */

export const csharpInstructions = (percyToken: string) => `
${percySetTokenStep(percyToken)}
---STEP---
Add Percy dependencies to your project
  - Add the Percy .NET Selenium NuGet package:
    dotnet add package PercyIO.Selenium

---STEP---
Update your C# Selenium test
  - Import the Percy snapshot helper:
    using PercyIO.Selenium;
  - In your test, take snapshots like this:
    Percy percy = new Percy(driver);
    percy.Snapshot("Your snapshot name");

Example:
\`\`\`csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using PercyIO.Selenium;

class PercyExample
{
    static void Main()
    {
        IWebDriver driver = new ChromeDriver();
        driver.Navigate().GoToUrl("http://localhost:8000");
        Percy percy = new Percy(driver);
        percy.Snapshot("Home page");
        driver.Quit();
    }
}
\`\`\`

---STEP---
Run Percy with your tests
  - Use the following command:
    PERCY_TOKEN=${percyToken} npx percy exec -- <your command to run tests>

${percyReviewSnapshotsStep}
`;
