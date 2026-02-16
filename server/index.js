import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const readContent = (filePath) => {
  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeContent = (filePath, content) => {
  writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
};

const sendJson = (res, status, body, corsOrigin) => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": corsOrigin,
    "access-control-allow-headers": "content-type, x-editable-password",
    "access-control-allow-methods": "GET, PUT, OPTIONS",
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
};

export function createEditableServer(options = {}) {
  const endpoint = options.endpoint || "/__editable";
  const password = options.password || "";
  const filePath = resolve(process.cwd(), options.filePath || "editable-content.json");
  const port = options.port || 3001;
  const corsOrigin = options.corsOrigin || "*";

  const server = createServer(async (req, res) => {
    const url = req.url ? req.url.split("?")[0] : "";
    if (url !== endpoint) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    if (req.method === "OPTIONS") {
      sendJson(res, 200, { ok: true }, corsOrigin);
      return;
    }

    if (password && req.headers["x-editable-password"] !== password) {
      sendJson(res, 401, { error: "Unauthorized" }, corsOrigin);
      return;
    }

    if (req.method === "GET") {
      sendJson(res, 200, readContent(filePath), corsOrigin);
      return;
    }

    if (req.method === "PUT") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            sendJson(res, 400, { error: "Body must be a JSON object" }, corsOrigin);
            return;
          }
          writeContent(filePath, parsed);
          sendJson(res, 200, { ok: true }, corsOrigin);
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body" }, corsOrigin);
        }
      });
      return;
    }

    sendJson(res, 405, { error: "Method Not Allowed" }, corsOrigin);
  });

  return {
    server,
    start() {
      server.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`[click2edit] server listening on http://localhost:${port}${endpoint}`);
      });
      return server;
    },
  };
}
