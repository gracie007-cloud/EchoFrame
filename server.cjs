"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const ROOT = __dirname;
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function isHealthPath(pathname) {
  return pathname === "/healthz" || pathname === "/healthz/" || pathname === "/_healthz";
}

function isPublicPath(pathname) {
  return pathname === "/" ||
    pathname === "/index.html" ||
    pathname === "/contextual-deployments.json" ||
    isHealthPath(pathname) ||
    pathname === "/deployments" ||
    pathname.startsWith("/deployments/") ||
    pathname.startsWith("/assets/");
}

function resolvePublicFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (error) {
    return { error: "Bad request" };
  }

  const segments = decoded.split("/");
  if (segments.includes("..") || decoded.includes("\\")) {
    return { error: "Bad request" };
  }
  if (!isPublicPath(decoded)) {
    return { error: "Not found" };
  }

  let relativePath = decoded === "/" ? "index.html" : decoded.slice(1);
  if (decoded !== "/" && decoded.endsWith("/")) {
    relativePath = path.join(relativePath, "index.html");
  }

  const absolutePath = path.resolve(ROOT, relativePath);
  if (absolutePath !== ROOT && !absolutePath.startsWith(ROOT + path.sep)) {
    return { error: "Bad request" };
  }

  return { absolutePath };
}

function serveFile(request, response, absolutePath) {
  fs.stat(absolutePath, (statError, stats) => {
    if (statError) {
      sendJson(response, statError.code === "ENOENT" ? 404 : 500, {
        error: statError.code === "ENOENT" ? "Not found" : "Unable to read file"
      });
      return;
    }

    if (stats.isDirectory()) {
      const location = request.url.endsWith("/") ? request.url : request.url + "/";
      response.writeHead(308, { location });
      response.end();
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const headers = {
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "content-length": stats.size,
      "x-content-type-options": "nosniff"
    };

    if (absolutePath.includes(path.sep + "assets" + path.sep)) {
      headers["cache-control"] = "public, max-age=300";
    } else {
      headers["cache-control"] = "no-store";
    }

    response.writeHead(200, headers);
    fs.createReadStream(absolutePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (isHealthPath(url.pathname)) {
    sendJson(response, 200, {
      status: "ok",
      app: "echoframe",
      uptime: Math.round(process.uptime())
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end();
    return;
  }

  const result = resolvePublicFile(url.pathname);
  if (result.error) {
    sendJson(response, result.error === "Bad request" ? 400 : 404, { error: result.error });
    return;
  }

  if (request.method === "HEAD") {
    fs.stat(result.absolutePath, (error, stats) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500);
      } else {
        response.writeHead(200, { "content-length": stats.size });
      }
      response.end();
    });
    return;
  }

  serveFile(request, response, result.absolutePath);
});

server.listen(PORT, HOST, () => {
  console.log(`EchoFrame static app listening on http://${HOST}:${PORT}`);
});
