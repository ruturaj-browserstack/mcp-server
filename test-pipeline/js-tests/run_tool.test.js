import { describe, it, expect } from 'vitest';
import { loadTests, buildCliArgs, MatchMode } from './base.js';
import { spawn } from 'child_process';

// Load all tests
const tests = loadTests();
const testsByTool = tests.reduce((acc, test) => {
  if (!acc[test.tool]) {
    acc[test.tool] = [];
  }
  acc[test.tool].push(test);
  return acc;
}, {});

async function runTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const cliArgs = buildCliArgs(toolName, args);
    const child = spawn(cliArgs[0], cliArgs.slice(1), { 
      stdio: 'pipe',
      shell: true
    });
    
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\nStderr: ${stderr}`));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse JSON output: ${err.message}\nOutput: ${stdout}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Helper function to compare content with match_mode
function compareContent(actual, expected) {
  if (!Array.isArray(actual?.content) || !Array.isArray(expected?.content)) {
    return false;
  }

  return expected.content.every((expectedItem, index) => {
    const actualItem = actual.content[index];
    if (!actualItem || actualItem.type !== expectedItem.type) {
      return false;
    }

    switch (expectedItem.match_mode) {
      case MatchMode.REGEX:
        try {
          const pattern = new RegExp(expectedItem.text);
          const matches = pattern.test(actualItem.text);
          if (!matches) {
            console.log(`Regex match failed:\nPattern: ${expectedItem.text}\nActual: ${actualItem.text}`);
          }
          return matches;
        } catch (err) {
          console.error(`Invalid regex pattern: ${expectedItem.text}`, err);
          return false;
        }
      
      case MatchMode.IGNORE:
        return true;

      case MatchMode.CONTAINS:
        const containsMatch = actualItem.text.includes(expectedItem.text);
        if (!containsMatch) {
          console.log(`Contains match failed:\nExpected to contain: ${expectedItem.text}\nActual: ${actualItem.text}`);
        }
        return containsMatch;
      
      case MatchMode.EXACT:
      default:
        const matches = actualItem.text === expectedItem.text;
        if (!matches) {
          console.log(`Exact match failed:\nExpected: ${expectedItem.text}\nActual: ${actualItem.text}`);
        }
        return matches;
    }
  });
}

// Create test suites for each tool
Object.entries(testsByTool).forEach(([toolName, toolTests]) => {
  describe(`Tool: ${toolName}`, () => {
    toolTests.forEach((test) => {
      it(`${test.name} [${test.sourceFile}]`, async () => {
        console.log(`Running test ${test.name} from ${test.sourceFile}`);
        
        const result = await runTool(test.tool, test.args);
        console.log(`Test result for ${test.name}:`, JSON.stringify(result, null, 2));
        if (test.expectedOutput) {
          if (test.expectedOutput.content) {
            const matches = compareContent(result, test.expectedOutput);
            expect(
              matches,
              `Response did not match expected pattern.\nExpected: ${JSON.stringify(test.expectedOutput, null, 2)}\nActual: ${JSON.stringify(result, null, 2)}`
            ).toBe(true);
          } else {
            expect(result).toEqual(test.expectedOutput);
          }
        } else {
          expect(result).toBeDefined();
        }
      }, 10000);
    });
  });
});
