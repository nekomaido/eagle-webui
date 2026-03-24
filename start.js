#!/usr/bin/env node

const { parseArgs } = require("node:util");
const path = require("node:path");

function parseCliArgs() {
  const options = {
    hostname: {
      type: "string",
      short: "H",
      default: "localhost",
    },
    port: {
      type: "string",
      short: "p",
      default: "34917",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  };

  let parsed;
  try {
    parsed = parseArgs({
      options,
      allowPositionals: false,
    });
  } catch (error) {
    console.error("❌ Invalid argument:", error.message);
    showHelp();
    process.exit(1);
  }

  if (parsed.values.help) {
    showHelp();
    process.exit(0);
  }

  return parsed.values;
}

function showHelp() {
  console.log(`
Eagle WebUI Server

Usage: npx @naamiru/eagle-webui [options]

Options:
  --hostname HOST, -H HOST     Bind server to specific hostname or IP address (default: localhost)
  --port PORT, -p PORT         Server port number (default: 34917)
  --help, -h                   Display this help message

Examples:
  npx @naamiru/eagle-webui                    # Load libraries from ./eagle
  npx @naamiru/eagle-webui --hostname 0.0.0.0
  `);
}

const args = parseCliArgs();

process.env.HOSTNAME = args.hostname;
process.env.PORT = args.port;

require(path.resolve(__dirname, ".next/standalone/server.js"));
