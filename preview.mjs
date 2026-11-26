// Local preview of docs/ exactly as GitHub Pages serves it: http://localhost:3002/woodmood-website-demo-/
//   node preview.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3002);
const BASE = "/woodmood-website-demo-/";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "docs");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".mp4": "video/mp4", ".txt": "text/plain" };

function resolve(urlPath) {
  if (!urlPath.startsWith(BASE)) return null;
  const rel = decodeURIComponent(urlPath.slice(BASE.length));
  const p = path.join(ROOT, rel);
  if (!p.startsWith(ROOT)) return null;
  for (const c of [p, path.join(p, "index.html"), p + ".html"]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = new URL(req.url, "http://x").pathname;
  if (urlPath === "/" || urlPath === BASE.slice(0, -1)) { res.writeHead(302, { Location: BASE }); return res.end(); }
  const file = resolve(urlPath) || path.join(ROOT, "404.html");
  const status = file.endsWith("404.html") && !urlPath.endsWith("404.html") ? 404 : 200;
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const size = fs.statSync(file).size;
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range && status === 200) { // videos need byte ranges
    const start = range[1] ? Number(range[1]) : 0, end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(status, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Démo : http://localhost:${PORT}${BASE}`));
