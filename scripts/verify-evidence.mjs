// Programmatic screenshot verification — replaces visual QA inspection.
// Loads each qa-screenshots/*.png into a headless Chromium canvas and checks:
//   1. Pixel dimensions match the capturing project's viewport
//   2. Luminance: dark captures are actually dark, light captures light
//   3. Brand accent presence: Signal Emerald pixels rendered (buttons/badges)
// Exits non-zero if any check fails. Emits a JSON summary to stdout.

import { chromium } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";

const VIEWPORTS = { desktop: 1280, tablet: 768, mobile: 375, dark: 1280 };
const ACCENTS = [0x087a52, 0x2db98a]; // light + dark Signal Emerald

function pngDimensions(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function closeTo(r, g, b, hex, tol = 30) {
  const tr = (hex >> 16) & 0xff, tg = (hex >> 8) & 0xff, tb = hex & 0xff;
  return Math.abs(r - tr) <= tol && Math.abs(g - tg) <= tol && Math.abs(b - tb) <= tol;
}

const files = readdirSync("qa-screenshots").filter((f) => f.endsWith(".png"));
if (files.length === 0) {
  console.error("No screenshots found in qa-screenshots/");
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome" }); // system Chrome, same as playwright.config.ts
const page = await browser.newPage();
await page.goto("about:blank");

const results = [];
let failures = 0;

for (const file of files) {
  const path = `qa-screenshots/${file}`;
  const buf = readFileSync(path);
  const { width, height } = pngDimensions(buf);
  const sizeKB = Math.round(statSync(path).size / 1024);

  const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  const px = await page.evaluate(
    async ([url]) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let lumSum = 0, accent = 0, darkPx = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) { // sample every 4th pixel
        const r = d[i], g = d[i + 1], b = d[i + 2];
        lumSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if ((r * 0.2126 + g * 0.7152 + b * 0.0722) < 60) darkPx++;
        if ((Math.abs(r - 0x08) <= 30 && Math.abs(g - 0x7a) <= 30 && Math.abs(b - 0x52) <= 30) ||
            (Math.abs(r - 0x2d) <= 30 && Math.abs(g - 0xb9) <= 30 && Math.abs(b - 0x8a) <= 30)) accent++;
        n++;
      }
      return { avgLum: lumSum / n, darkRatio: darkPx / n, accentRatio: accent / n };
    },
    [dataUrl],
  );

  const project = Object.keys(VIEWPORTS).find((p) => file.includes(`-${p}`)) ?? null;
  const isDarkCapture = file.includes("-dark");
  // Dark dialogs sit over a translucent overlay — allow mid luminance.
  const darkLimit = file.includes("dialog") ? 115 : 95;

  const checks = {
    sizeKB,
    dims: `${width}x${height}`,
    widthOk: project ? width === VIEWPORTS[project] : true,
    nonTrivial: sizeKB > 20 && height > 300,
    avgLum: Math.round(px.avgLum),
    accentRatio: +(px.accentRatio * 100).toFixed(2),
    lumOk: isDarkCapture ? px.avgLum < darkLimit : px.avgLum > 120,
    accentOk: px.accentRatio > 0.0002, // accent pixels present (button/metric renders)
  };

  const allOk = checks.widthOk && checks.nonTrivial && checks.lumOk && checks.accentOk;
  if (!allOk) failures++;

  results.push({ file, ...checks, allOk });
}

await browser.close();

const summary = {
  total: results.length,
  passed: results.length - failures,
  failed: failures,
  details: results,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(failures > 0 ? 1 : 0);
