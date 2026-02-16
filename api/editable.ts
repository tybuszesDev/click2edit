import { list, put } from "@vercel/blob";

const PATHNAME = "click2edit/editable-content.json";
const resolveBlobToken = () =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.click2edit_READ_WRITE_TOKEN || "";

const withCors = (res: any) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, PUT, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, x-editable-password");
  res.setHeader("content-type", "application/json; charset=utf-8");
};

const parseObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const getBlobJson = async (): Promise<Record<string, unknown>> => {
  const token = resolveBlobToken();
  if (!token) return {};
  const { blobs } = await list({ prefix: PATHNAME, limit: 1, token });
  const blob = blobs.find((item) => item.pathname === PATHNAME) ?? blobs[0];
  if (!blob) return {};
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return {};
  const data = await response.json();
  return parseObject(data);
};

const getRequestBody = (req: any): Record<string, unknown> => {
  if (typeof req.body === "string") {
    try {
      return parseObject(JSON.parse(req.body));
    } catch {
      return {};
    }
  }
  return parseObject(req.body);
};

export default async function handler(req: any, res: any) {
  withCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end(JSON.stringify({ ok: true }));
    return;
  }

  const blobToken = resolveBlobToken();
  if (!blobToken) {
    res.status(500).end(JSON.stringify({ error: "Missing Blob token env variable" }));
    return;
  }

  const password = process.env.EDITABLE_PASSWORD || "";
  if (password && req.headers["x-editable-password"] !== password) {
    res.status(401).end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  if (req.method === "GET") {
    const content = await getBlobJson();
    res.status(200).end(JSON.stringify(content));
    return;
  }

  if (req.method === "PUT") {
    const next = getRequestBody(req);
    await put(PATHNAME, JSON.stringify(next), {
      token: blobToken,
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    res.status(200).end(JSON.stringify({ ok: true }));
    return;
  }

  res.status(405).end(JSON.stringify({ error: "Method Not Allowed" }));
}
