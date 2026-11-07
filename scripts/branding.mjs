// SPDX-License-Identifier: AGPL-3.0-only
import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
const source = await readFile("assets/branding/echo-master.svg", "utf8");
const out = "apps/client/public/icons";
await mkdir(out, { recursive: true });
for (const [name, size] of [
  ["icon-192", 192],
  ["icon-512", 512],
  ["icon-1024", 1024],
  ["apple-touch-icon", 180],
  ["maskable-512", 512],
]) {
  let svg = source;
  if (name.startsWith("maskable"))
    svg = source
      .replace('rx="224"', 'rx="0"')
      .replace(
        '<g id="primary-symbol"',
        '<g transform="translate(102.4 102.4) scale(.8)"><g id="primary-symbol"',
      )
      .replace("</svg>", "</g></svg>");
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`${out}/${name}.png`);
}
const foreground = source
  .replace(/<g id="background">.*?<\/g>/s, "")
  .replace(
    '<g id="primary-symbol"',
    '<g transform="translate(150 150) scale(.7)"><g id="primary-symbol"',
  )
  .replace("</svg>", "</g></svg>");
await sharp(Buffer.from(foreground))
  .resize(432)
  .png()
  .toFile(`${out}/adaptive-foreground.png`);
await sharp(Buffer.from(foreground.replaceAll("#fff", "#000")))
  .resize(432)
  .png()
  .toFile(`${out}/monochrome.png`);
await writeFile("apps/client/public/logo.svg", source);
await writeFile(
  "assets/branding/echo-dark.svg",
  source.replaceAll("#7e84ff", "#34374f").replaceAll("#5056de", "#202232"),
);
await writeFile(
  "assets/branding/echo-monochrome.svg",
  foreground
    .replaceAll("#fff", "#6269f5")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n"),
);
