// SPDX-License-Identifier: AGPL-3.0-only
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
const root = "dist";
async function list(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.isDirectory()) result.push(...(await list(join(dir, item.name))));
    else if (!item.name.endsWith(".map") && item.name !== "sw.js")
      result.push(join(dir, item.name));
  }
  return result;
}
const indexPath = join(root, "index.html");
const html = (await readFile(indexPath, "utf8"))
  .replace(/<title>.*?<\/title>/, "<title>Echo — Private thinking space</title>")
  .replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
  .replace("</head>", `<meta name="description" content="A private, local-first space for your thoughts. Capture, connect and develop ideas.">
<meta name="theme-color" content="#6269f5">
<meta property="og:title" content="Echo — Private thinking space">
<meta property="og:description" content="Capture thoughts, connect ideas, and work offline.">
<meta property="og:image" content="/icons/icon-512.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<style>html,body,#root{height:100%;}*{box-sizing:border-box;}input,textarea{outline-color:#6269f5;} :focus-visible{outline:2px solid #6269f5;outline-offset:3px;} [data-testid="material-glass"]{backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);}@media(prefers-reduced-transparency:reduce){[data-testid="material-glass"]{backdrop-filter:none;-webkit-backdrop-filter:none;}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}</style>
</head>`);
await writeFile(indexPath, html);
const files = await list(root);
const hash = createHash("sha256");
for (const file of files) hash.update(await readFile(file));
const version = hash.digest("hex").slice(0, 16);
const history = JSON.parse(
  await readFile("../../packages/core/src/changelog.json", "utf8"),
);
const release = { ...history[0], build: version };
await writeFile(join(root, "release.json"), JSON.stringify(release));
files.push(join(root, "release.json"));
const urls = files.map((f) => "/" + f.slice(root.length + 1));
const sw = `const CACHE='echo-${version}';const RELEASE=${JSON.stringify(release)};const ASSETS=${JSON.stringify(urls)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('echo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE')self.skipWaiting();if(e.data?.type==='RELEASE_INFO'&&e.ports[0])e.ports[0].postMessage(RELEASE)});self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}if(ASSETS.includes(u.pathname))e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});`;
await writeFile(join(root, "sw.js"), sw);
const registration = `<script>if('serviceWorker'in navigator){let switching=false;const hadController=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(switching||!hadController)return;switching=true;location.reload()});navigator.serviceWorker.register('/sw.js').then(r=>{if(r.waiting)window.dispatchEvent(new Event('echo-update-ready'));r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)window.dispatchEvent(new Event('echo-update-ready'))})});document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update()})})}</script>`;
await writeFile(indexPath, html.replace("</body>", registration + "</body>"));
console.log("PWA ready:", version, urls.length, "precache assets");
