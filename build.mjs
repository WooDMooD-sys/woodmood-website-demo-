// Builds the password-protected demo for GitHub Pages into docs/.
// Source: ../Site Internet/nouveau-site (only read, never changed).
//
//   node build.mjs            (asks for the password; or put it in a local file .demo-password)
//
// Every page is encrypted (AES-256-GCM, key from the password with PBKDF2) and replaced by a
// small password screen that decrypts it in the browser. Once the password is typed, it is
// remembered in that browser, so it is asked only once.
// Photos, videos, CSS and JS are copied as they are (not encrypted).
// Demo changes: notes tool removed, contact form sends nothing, links prefixed with BASE.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { webcrypto as crypto } from "node:crypto";
import { fileURLToPath } from "node:url";

const BASE = "/woodmood-website-demo-/"; // = "/<repo name>/" on https://<user>.github.io/<repo name>/
const ITERATIONS = 600000;
const SALT = "d29vZG1vb2QtZGVtby1zaXRlLXNhbHQtdjE="; // fixed so a remembered password survives rebuilds

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, "../Site Internet/nouveau-site");
const OUT = path.join(here, "docs");
const SKIP = (rel) => path.basename(rel).startsWith("_") || rel === "js/notes.js";

async function getPassword() {
  if (process.env.DEMO_PASSWORD) return process.env.DEMO_PASSWORD;
  const file = path.join(here, ".demo-password");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const pw = (await rl.question("Mot de passe de la démo : ")).trim();
  rl.close();
  return pw;
}

function list(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? list(full, base) : [path.relative(base, full).split(path.sep).join("/")];
  });
}

const b64 = (u8) => Buffer.from(u8).toString("base64");
const rebase = (text) =>
  text
    .replace(/(\s[\w:-]+=")\/(?!\/)/g, `$1${BASE}`) // href="/x", src="/x", data-full="/x"…
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}`);

async function deriveKey(password) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: Buffer.from(SALT, "base64"), iterations: ITERATIONS, hash: "SHA-256" }, base, 256);
  return crypto.subtle.importKey("raw", bits, "AES-GCM", false, ["encrypt"]);
}

async function encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  return { iv: b64(iv), ct: b64(new Uint8Array(ct)) };
}

function lockedPage({ iv, ct }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>WooDMooD – démo</title>
<link rel="icon" href="${BASE}favicon.ico">
<style>
  html,body{margin:0;height:100%;background:#111;color:#eee;font-family:Montserrat,Arial,sans-serif}
  body{display:flex;align-items:center;justify-content:center}
  form{width:min(320px,86vw);text-align:center}
  img{width:180px;max-width:70%;margin-bottom:18px;filter:brightness(0) invert(1)}
  p{font-size:14px;color:#bbb;margin:0 0 18px}
  input,button{box-sizing:border-box;width:100%;padding:12px 14px;border-radius:6px;font-size:15px}
  input{border:1px solid #444;background:#1c1c1c;color:#fff;margin-bottom:10px}
  button{border:0;background:#e8892f;color:#000;font-weight:bold;cursor:pointer}
  button:disabled{opacity:.6;cursor:wait}
  #err{color:#ff8a7a;margin-top:12px}
</style>
</head>
<body>
<form id="gate" hidden>
  <img src="${BASE}woodmood-logo.png" alt="WooDMooD">
  <p>Site de démonstration – accès réservé</p>
  <input id="pw" type="password" placeholder="Mot de passe" autocomplete="current-password" required>
  <button id="go">Entrer</button>
  <p id="err" hidden>Mot de passe incorrect</p>
</form>
<script>
(function () {
  var D = { salt: "${SALT}", it: ${ITERATIONS}, iv: "${iv}", ct: "${ct}" }, STORE = "woodmood-demo-key";
  function bytes(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function b64(u8) { return btoa(String.fromCharCode.apply(null, u8)); }
  async function decrypt(raw) {
    var key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(D.iv) }, key, bytes(D.ct)));
  }
  function render(html) {
    // the page must be fully loaded, otherwise document.write appends instead of replacing
    if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", function () { render(html); });
    document.open(); document.write(html); document.close();
    if (location.hash) setTimeout(function () { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }, 300);
  }
  async function derive(pw) {
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: bytes(D.salt), iterations: D.it, hash: "SHA-256" }, base, 256));
  }
  var form = document.getElementById("gate");
  function ask() { form.hidden = false; document.getElementById("pw").focus(); }
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var go = document.getElementById("go"), err = document.getElementById("err");
    go.disabled = true; err.hidden = true;
    try {
      var raw = await derive(document.getElementById("pw").value);
      var html = await decrypt(raw);
    } catch (x) { err.hidden = false; go.disabled = false; return; }
    try { localStorage.setItem(STORE, b64(raw)); } catch (x) {}
    render(html);
  });
  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (x) {}
  if (saved) decrypt(bytes(saved)).then(render, function () { try { localStorage.removeItem(STORE); } catch (x) {} ask(); });
  else ask();
})();
</script>
</body>
</html>
`;
}

const notFound = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>WooDMooD – démo</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111;color:#eee;font-family:Montserrat,Arial,sans-serif;text-align:center}a{color:#e8892f}</style>
</head><body><div><p>Cette page n'existe pas dans la démo.</p><p><a href="${BASE}">Retour à l'accueil</a></p></div></body></html>
`;

const password = await getPassword();
if (!password) { console.error("Aucun mot de passe : rien n'a été construit."); process.exit(1); }
const key = await deriveKey(password);

fs.rmSync(OUT, { recursive: true, force: true });
let pages = 0, files = 0;
for (const rel of list(SRC).filter((r) => !SKIP(r))) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let buf = fs.readFileSync(path.join(SRC, rel));
  if (rel.endsWith(".html")) {
    const html = rebase(buf.toString("utf8").replace(/^[ \t]*<script src="\/js\/notes\.js"><\/script>\r?\n/m, ""));
    fs.writeFileSync(dest, lockedPage(await encrypt(key, html)));
    pages++;
    continue;
  }
  if (rel === "js/contact.js") {
    const before = "fetch(form.action, { method: 'POST', mode: 'no-cors', body: data })";
    const text = buf.toString("utf8");
    if (!text.includes(before)) throw new Error("contact.js a changé : mettre à jour le patch démo dans build.mjs");
    buf = Buffer.from(text.replace(before,
      "/* DÉMO : rien n'est envoyé au vrai Google Form, on affiche directement la confirmation */\n    Promise.resolve(data)"));
  } else if (rel.endsWith(".css")) {
    buf = Buffer.from(rebase(buf.toString("utf8")));
  }
  fs.writeFileSync(dest, buf);
  files++;
}
fs.writeFileSync(path.join(OUT, "404.html"), notFound);
fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`OK : ${pages} pages chiffrées, ${files} fichiers copiés dans docs/`);
