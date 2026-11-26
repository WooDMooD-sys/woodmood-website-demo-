# WooDMooD demo site — instructions for Claude

Password-protected demo of the new WooDMooD website, reviewed by an outside website contractor
and by a client. Published on **GitHub Pages**, NOT Cloudflare: never deploy it with wrangler.

- Repo: https://github.com/WooDMooD-sys/woodmood-website-demo- (**public**: free GitHub plan)
- Live: https://woodmood-sys.github.io/woodmood-website-demo-/ (Pages source: branch `main`, folder `/docs`)
- The user speaks French and English; the site and the user-facing files are in French.

## Layout

| Path | What it is | On GitHub? |
|---|---|---|
| `site/` | **The editable site** (plain HTML/CSS/JS, images, videos). All edits go here. | **No** (gitignored) |
| `mot-de-passe.txt` | The demo password, one line. The user is fine with Claude reading it. | **No** (gitignored) |
| `build.mjs` | Encrypts `site/` into `docs/` with the password, removing drafts on the way | Yes |
| `docs/` | Build output that GitHub Pages serves. Never edit by hand: rebuild. | Yes |
| `preview.mjs` | Local server: `site/` at `/`, or `docs/` (arg `docs`) under `/woodmood-website-demo-/` | Yes |
| `publier.cmd` | Double-click: `node build.mjs` → `git add -A` → commit → push | Yes |
| `voir-en-local.cmd` | Double-click: opens http://localhost:3002/ on `site/` | Yes |
| `ancienne-version-cloudflare/`, branch `cloudflare-version` | Abandoned Cloudflare attempt. Ignore; never push. | No |

`site/` started as a copy of `../Site Internet/nouveau-site` (2026-11-26). The two are now separate:
edits in one do not reach the other. The live site connectwoodmood.com is a different project
(`../Site Internet`, deployed with wrangler) and is not touched by any of this.

## Hard rules

1. **Never commit or push `site/` or `mot-de-passe.txt`**, and never put readable page content or the
   password anywhere in the repo (commit messages included). The repo is public: only the encrypted
   `docs/` may contain the pages. Before any commit, `git status` must show nothing under `site/`.
2. **No drafts may reach the demo** (it is shown to a contractor and a client). `build.mjs` strips the
   known ones and **stops the build** if any remain (see below). Don't weaken that check to get a build
   through: fix the page in `site/`, or add a targeted rule to `removeDrafts`.
3. Edit in `site/`, then rebuild. Never hand-edit `docs/`.
4. Commit/push only when the user asks (or runs `publier.cmd`). Git identity is set locally in this repo.

## Workflow

- See changes locally: `node preview.mjs` → http://localhost:3002/ (or `voir-en-local.cmd`).
  The page links are root-relative (`/css/site.css`), so opening the .html files directly from disk does not work: use the preview.
- Check the encrypted result: `node build.mjs && node preview.mjs docs` → http://localhost:3002/woodmood-website-demo-/
- Publish: `publier.cmd`, or `node build.mjs`, `git add -A`, `git commit`, `git push`.
- After a push, GitHub Pages takes 1–2 min, and caches pages for 10 min (`max-age=600`). "Still showing the
  old version" right after a push is almost always cache: check with a `?v=N` query string or `curl`.

## What build.mjs does

1. Reads every file in `site/`, skipping draft files (names starting with `_`) and `js/notes.js` (the local notes tool).
2. `removeDrafts()` on each page: removes HTML comments, the "Brouillon — non publié" ribbon, the notes
   script, the empty Blog menu, `.todo-media` placeholder boxes, and links to pages that don't exist in the demo
   (`/faq`, `/temoignages`). It points `/mentions-legales` and `/politique-de-confidentialite` to the live site,
   points `/poele-a-bois-automatique` to `/#produit`, and turns the unfinished Atelier example into "Exemples à venir".
3. `checkDrafts()` fails the build, listing page and excerpt, on draft signs (brouillon, à compléter, à fournir,
   à reprendre, `[… à …]`, todo/placeholder classes, comments, notes.js) and on internal links to missing pages.
   When a page is finished (e.g. a real `/blog` or `/temoignages` page is added to `site/`), remove the matching
   rule from `removeDrafts` so it shows up.
4. Strips CSS comments, sets the contact form to demo mode (nothing is sent to the Google Form), and publishes
   only the images and videos that a page uses (plus the icons).
5. Prefixes root-relative links with `BASE` (`/woodmood-website-demo-/`, the repo name). If the repo is renamed,
   change `BASE` in both `build.mjs` and `preview.mjs`.
6. Encrypts each page: AES-256-GCM, key = PBKDF2-SHA256 (600k iterations, fixed `SALT`) of the password. Each
   page becomes a small password screen that decrypts it in the browser and keeps the key in `localStorage`, so
   visitors type the password only once. Changing the password = edit `mot-de-passe.txt`, rebuild, push.

Not encrypted (by design, so they keep working): images, videos, CSS, JS. Someone with an exact file URL can open them.

## Testing a change

- Locally, test with `preview.mjs docs` in a browser: password screen → correct password → page renders once
  (exactly one `<title>`, no `#gate` left in the DOM), videos play (`readyState` 4), no console errors.
- Pages written via `document.write` must wait for `DOMContentLoaded` (already handled in `render()`);
  otherwise the site gets appended under the password screen.
