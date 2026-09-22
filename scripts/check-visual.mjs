/**
 * Responsive and degradation checks against a running build.
 *
 * These are the assertions that caught real bugs rather than confirming
 * assumptions: the architecture graph was rendering at ~40% of its canvas, and
 * the outermost label clipped at 375px ("Browser" as "rowser"). Neither shows
 * up in Lighthouse, a type check or a lint pass.
 *
 * Asserts, at 375 / 768 / 1440 in both themes:
 *   - no horizontal overflow
 *   - no console errors or warnings, and no uncaught page errors
 *   - the WebGL canvas acquires a context and projects every node label
 * Plus two degradation paths:
 *   - prefers-reduced-motion mounts no canvas and keeps the server-rendered SVG
 *   - with JavaScript disabled the diagram and the case-study cards still render
 *
 * Usage:
 *   npm run build && npm start &
 *   npm run check:visual                 # defaults to http://localhost:3000
 *   BASE_URL=... CHROME_PATH=... npm run check:visual
 *   npm run check:visual -- --screenshots ./out
 */
import { existsSync, mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const shotIndex = process.argv.indexOf("--screenshots");
const SHOT_DIR = shotIndex === -1 ? null : process.argv[shotIndex + 1];
if (SHOT_DIR) mkdirSync(SHOT_DIR, { recursive: true });

/** Puppeteer-core ships no browser, so find an installed one. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error("No Chrome found. Set CHROME_PATH.");
  return found;
}

const VIEWPORTS = [
  { name: "375", width: 375, height: 812, scale: 2 },
  { name: "768", width: 768, height: 1024, scale: 1 },
  { name: "1440", width: 1440, height: 900, scale: 1 },
];

const problems = [];
const fail = (message) => problems.push(message);

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: "new",
  // SwiftShader so the WebGL assertions hold on a headless CI box with no GPU.
  args: ["--no-sandbox", "--disable-gpu", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const theme of ["dark", "light"]) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.scale,
    });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);

    const noise = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) noise.push(`[${message.type()}] ${message.text()}`);
    });
    page.on("pageerror", (error) => noise.push(`[pageerror] ${error.message}`));

    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 60_000 });

    // The canvas is deliberately lazy, so it only exists once the section is near.
    await page.evaluate(() => document.querySelector("#systems")?.scrollIntoView());
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const canvas = await page.evaluate(() => {
      const element = document.querySelector("#architecture-stage canvas");
      if (!element) return { present: false };
      return {
        present: true,
        context: Boolean(element.getContext("webgl2") ?? element.getContext("webgl")),
        labels: document.querySelectorAll("#architecture-stage [style*='translate3d']").length,
      };
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    // One projected label per node; the node list is the source of truth for
    // how many the active topology has.
    const expectedLabels = await page.evaluate(
      () => document.querySelectorAll("#architecture-nodes > li").length,
    );

    const id = `${theme}/${viewport.name}`;
    if (overflow > 0) fail(`${id}: horizontal overflow of ${overflow}px`);
    if (noise.length) fail(`${id}: ${noise.join(" | ")}`);
    if (!canvas.present) fail(`${id}: WebGL canvas never mounted`);
    else if (!canvas.context) fail(`${id}: canvas has no WebGL context`);
    else if (canvas.labels !== expectedLabels) {
      fail(`${id}: projected ${canvas.labels} labels, expected ${expectedLabels}`);
    }

    console.log(
      `  ${theme.padEnd(5)} ${viewport.name.padStart(4)}px  ` +
        `canvas=${canvas.present ? `gl:${canvas.context} labels:${canvas.labels}/${expectedLabels}` : "none"}  ` +
        `overflowX=${overflow}px  console=${noise.length}`,
    );

    if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/home-${theme}-${viewport.name}.png` });
    await page.close();
  }
}

// Reduced motion: no WebGL at all, and the server-rendered SVG stays.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.querySelector("#systems")?.scrollIntoView());
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const state = await page.evaluate(() => ({
    canvas: Boolean(document.querySelector("#architecture-stage canvas")),
    svg: Boolean(document.querySelector("#architecture-stage svg")),
  }));
  console.log(`  reduced-motion  canvas=${state.canvas} svg=${state.svg}`);
  if (state.canvas) fail("reduced-motion still mounted the WebGL canvas");
  if (!state.svg) fail("reduced-motion has no SVG diagram");
  await page.close();
}

// No JavaScript: the page is still the page.
{
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  const state = await page.evaluate(() => ({
    svg: document.querySelectorAll("#architecture-stage svg").length,
    headings: document.querySelectorAll("h1").length,
    cards: document.querySelectorAll("#work article").length,
  }));
  console.log(`  no-javascript   svg=${state.svg} h1=${state.headings} caseStudyCards=${state.cards}`);
  if (!state.svg) fail("no-JS render has no diagram");
  if (state.headings !== 1) fail(`no-JS render has ${state.headings} h1 elements, expected exactly 1`);
  if (state.cards < 3) fail(`no-JS render has ${state.cards} case-study cards, expected 3`);
  await page.close();
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAll responsive and degradation checks passed.");
