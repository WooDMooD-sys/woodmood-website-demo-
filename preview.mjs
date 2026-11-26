// Local preview (or double-click voir-en-local.cmd).
//   node preview.mjs         → the editable site (site/), as you edit it: http://localhost:3002/
//   node preview.mjs docs    → the encrypted version, as GitHub Pages will show it:
//                              http://localhost:3002/woodmood-website-demo-/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3002);
const DOCS = process.argv[2] === "docs";
const BASE = DOCS ? "/woodmood-website-demo-/" : "/";
const ROOT = path.join(here, DOCS ? "docs" : "site");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".mp4": "video/mp4", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };

function resolve(urlPath) {
  if (!urlPath.startsWith(BASE)) return null;
  const p = path.join(ROOT, decodeURIComponent(urlPath.slice(BASE.length)));
  if (!p.startsWith(ROOT)) return null;
  for (const c of [p, path.join(p, "index.html"), p + ".html"]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = new URL(req.url, "http://x").pathname;
  // the site's "Notes" panel saves here (local only, file never published)
  if (!DOCS && urlPath === "/__notes" && req.method === "POST") {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (c) => (body += c));
    req.on("end", () => { fs.writeFileSync(path.join(ROOT, "_notes-modifications.md"), body); res.writeHead(204); res.end(); });
    return;
  }
  if (DOCS && (urlPath === "/" || urlPath === BASE.slice(0, -1))) { res.writeHead(302, { Location: BASE }); return res.end(); }
  const found = resolve(urlPath);
  const file = found || (DOCS ? path.join(ROOT, "404.html") : null);
  if (!file) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Page introuvable"); }
  const status = found ? 200 : 404;
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const size = fs.statSync(file).size;
  const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-store" };
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range && status === 200) { // videos need byte ranges
    const start = range[1] ? Number(range[1]) : 0, end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(status, { ...headers, "Content-Length": size });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`${DOCS ? "Version chiffrée" : "Site"} : http://localhost:${PORT}${BASE}   (Ctrl+C pour arrêter)`));
