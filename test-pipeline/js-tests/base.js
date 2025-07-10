import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TEST_BED_DIR, MCP_CONFIG_PATH, MCP_SERVER } from './config.js';

// Enum for match modes in test comparisons
export const MatchMode = {
  EXACT: 'exact',
  IGNORE: 'ignore',
  REGEX: 'regex',
  CONTAINS: 'contains'
};

console.log('Loading MCP config from:', MCP_CONFIG_PATH);

export function loadTests() {
  const tests = [];
  const files = fs.readdirSync(TEST_BED_DIR);

  for (const filename of files) {
    if (filename.startsWith('selfheal.json')) {
      const filePath = path.join(TEST_BED_DIR, filename);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.tests) {
          // Add file information to each test for better reporting
          const testsWithSource = data.tests
            .filter(test => !test.deactivate)
            .map(test => ({
              ...test,
              sourceFile: filename
            }));
          tests.push(...testsWithSource);
        }
      } catch (err) {
        console.error(`Error loading test file ${filename}:`, err.message);
      }
    }
  }

  console.log(`Loaded ${tests.length} tests from ${files.length} files`);
  return tests;
}

export function generateArgValue(val) {
  if (typeof val === 'string') {
    // Replace <random_string> with a short UUID
    return val.replace(/<random_string>/g, uuidv4().substring(0, 8));
  }
  return val;
}

export function buildCliArgs(toolName, toolArgs) {
  function quoteIfNeeded(val) {
    if (typeof val === 'string' && val.includes(' ')) {
      // Escape any embedded double quotes
      return `"${val.replace(/"/g, '\\"')}"`;
    }
    // Always quote arrays and objects (JSON)
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      return `"${val.replace(/"/g, '\\"')}"`;
    }
    return val;
  }

  const args = [
    'npx',
    '@modelcontextprotocol/inspector',
    '--cli',
    '--config', quoteIfNeeded(MCP_CONFIG_PATH),
    '--server', MCP_SERVER,
    '--method', 'tools/call',
    '--tool-name', toolName
  ];

  for (const [key, value] of Object.entries(toolArgs)) {
    let processedValue = generateArgValue(value);
    if (
      Array.isArray(processedValue) ||
      (typeof processedValue === 'object' && processedValue !== null)
    ) {
      processedValue = JSON.stringify(processedValue);
    }
    args.push('--tool-arg', `${key}=${quoteIfNeeded(processedValue)}`);
  }

  return args;
}
