import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to a local config file if not specified in environment
export const MCP_CONFIG_PATH = "/Users/sushant/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
export const MCP_SERVER = 'browserstack';
export const TEST_BED_DIR = path.join(__dirname, '../test-bed/tools');
