import { list, put } from "@vercel/blob";
import { createHmac, timingSafeEqual } from "node:crypto";

const PATHNAME = "click2edit/editable-content.json";
const resolveBlobToken = () =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.click2edit_READ_WRITE_TOKEN || "";

const withCors = (res: any) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, x-editable-password");
  res.setHeader("content-type", "application/json; charset=utf-8");
};

const parseObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const parseBody = (req: any): unknown => {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body ?? {};
};

const parseCookies = (cookieHeader: string | undefined) =>
  Object.fromEntries(
    (cookieHeader || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const eq = part.indexOf("=");
        if (eq < 0) return [part, ""];
        return [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))];
      }),
  );

const sign = (input: string, secret: string) =>
  createHmac("sha256", secret).update(input).digest("base64url");

const issueSessionToken = (secret: string) => {
  const payload = JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 24 });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
};

const verifySessionToken = (token: string | undefined, secret: string) => {
  if (!token || !secret) return false;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return false;
  const expected = sign(encoded, secret);
  const a = new TextEncoder().encode(sig);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
};

const getBlobJson = async (): Promise<Record<string, unknown>> => {
  const token = resolveBlobToken();
  if (!token) return {};
  try {
    const { blobs } = await list({ prefix: PATHNAME, limit: 1, token });
    const blob = blobs.find((item) => item.pathname === PATHNAME) ?? blobs[0];
    if (!blob) return {};
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return {};
    const data = await response.json();
    return parseObject(data);
  } catch {
    return {};
  }
};

const getRequestBody = (req: any): Record<string, unknown> => {
  return parseObject(parseBody(req));
};

export default async function handler(req: any, res: any) {
  try {
    withCors(res);

    if (req.method === "OPTIONS") {
      res.status(200).end(JSON.stringify({ ok: true }));
      return;
    }

    const password = process.env.EDITABLE_PASSWORD || "";
    const sessionSecret = process.env.EDITABLE_SESSION_SECRET || password;
    const blobToken = resolveBlobToken();

    if (req.method === "POST") {
      const body = parseBody(req) as { password?: unknown };
      const entered = typeof body.password === "string" ? body.password : "";
      if (!password || entered !== password) {
        res.status(401).end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const token = issueSessionToken(sessionSecret);
      res.setHeader(
        "set-cookie",
        `editable_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      );
      res.status(200).end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === "GET") {
      const content = await getBlobJson();
      res.status(200).end(JSON.stringify(content));
      return;
    }

    if (req.method === "PUT") {
      if (!blobToken) {
        res.status(500).end(JSON.stringify({ error: "Missing Blob token env variable" }));
        return;
      }
      const cookies = parseCookies(req.headers.cookie as string | undefined);
      const sessionOk = verifySessionToken(cookies.editable_session, sessionSecret);
      const headerOk = password && req.headers["x-editable-password"] === password;
      if (!sessionOk && !headerOk) {
        res.status(401).end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const next = getRequestBody(req);
      await put(PATHNAME, JSON.stringify(next), {
        token: blobToken,
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      });
      res.status(200).end(JSON.stringify({ ok: true }));
      return;
    }

    res.status(405).end(JSON.stringify({ error: "Method Not Allowed" }));
  } catch (error: any) {
    const message = error?.message || "Unhandled function error";
    res.status(500).end(JSON.stringify({ error: message }));
  }
}
