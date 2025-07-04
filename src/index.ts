#!/usr/bin/env node

import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
import "dotenv/config";
import { logger, createMcpServer } from "browserstack-mcp-server";

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000;
console.log(`Starting BrowserStack MCP HTTP Server on port ${PORT}`);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS?.split(",") || [
  "127.0.0.1",
  "localhost",
];

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    exposedHeaders: ["mcp-session-id"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "mcp-session-id",
      "browserstack-username",
      "browserstack-access-key",
    ],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    transports: Object.keys(transports).length,
  });
});

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const browserstackUsername = req.headers["browserstack-username"] as
      | string
      | undefined;
    const browserstackAccessKey = req.headers["browserstack-access-key"] as
      | string
      | undefined;

    if (!browserstackUsername || !browserstackAccessKey) {
      logger.warn("Missing BrowserStack credentials in headers");
      res.status(401).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Unauthorized: Missing BrowserStack credentials",
        },
        id: null,
      });
      return;
    }

    let transport: StreamableHTTPServerTransport;

    logger.info(`Received MCP POST request, sessionId: ${sessionId}`);

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
      logger.info(`Reusing existing transport for session: ${sessionId}`);
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      logger.info("Creating new MCP session");

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          logger.info(`Session initialized: ${newSessionId}`);
          transports[newSessionId] = transport;
        },
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          logger.info(
            `Cleaning up transport for session: ${transport.sessionId}`,
          );
          delete transports[transport.sessionId];
        }
      };

      // Create and connect MCP server
      const server = createMcpServer({
        "browserstack-username": browserstackUsername,
        "browserstack-access-key": browserstackAccessKey,
      }) as McpServer;

      await server.connect(transport);

      logger.info("MCP server connected to transport");
    } else {
      // Invalid request
      logger.warn("Invalid MCP request - no valid session ID provided");
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  logger.info(`Received request for session: ${sessionId}`);

  if (!sessionId || !transports[sessionId]) {
    logger.warn(`Invalid or missing session ID: ${sessionId}`);
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Invalid or missing session ID",
      },
      id: null,
    });
    return;
  }

  try {
    const transport = transports[sessionId];
    logger.info(`Handling session request for: ${sessionId}`);
    await transport.handleRequest(req, res);
  } catch (error) {
    logger.error("Error handling session request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
};

app.get("/mcp", handleSessionRequest);

app.delete("/mcp", handleSessionRequest);

app.use((err: any, req: express.Request, res: express.Response) => {
  logger.error("Express error:", err);
  if (!res.headersSent) {
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal server error",
      },
      id: null,
    });
  }
});

async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      logger.info(
        `BrowserStack MCP HTTP Server v${packageJson.version} listening on port ${PORT}`,
      );
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
      logger.info(`MCP endpoint available at: http://localhost:${PORT}/mcp`);
      logger.info(`Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
      logger.info(`Allowed hosts: ${ALLOWED_HOSTS.join(", ")}`);
    });

    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM, shutting down gracefully");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down gracefully");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("exit", () => {
  logger.flush();
});

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
