"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");

function collectFiles(dir, extensions) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath, extensions);
    }
    return extensions.includes(path.extname(entry.name)) ? [fullPath] : [];
  });
}

const files = [
  path.join(ROOT, "server.cjs"),
  path.join(ROOT, "assets", "echoframe.js"),
  ...collectFiles(path.join(ROOT, "assets", "js"), [".mjs"])
];

let failed = false;
for (const file of files) {
  const relative = path.relative(ROOT, file);
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: ROOT,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || result.stdout || `Syntax check failed: ${file}\n`);
  } else {
    process.stdout.write(`ok ${relative}\n`);
  }
}

process.exit(failed ? 1 : 0);
