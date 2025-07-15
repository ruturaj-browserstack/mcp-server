import { CreateTestCasesFromFileArgs } from "./TCG-utils/types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserStackConfig } from "../../lib/types.js";
export declare function createTestCasesFromFile(args: CreateTestCasesFromFileArgs, context: any, config: BrowserStackConfig): Promise<CallToolResult>;
