/**
 * Contrast guard.
 *
 * Reads the real token values out of src/app/globals.css and asserts that every
 * foreground/background pair the site actually renders clears WCAG AA (4.5:1),
 * in both themes.
 *
 * This exists because Lighthouse is not sufficient here: it only exercises
 * whichever theme the run resolved to, and only the pairings that happened to
 * be on the page it loaded. A 100 accessibility score came back while three
 * pairs were failing — `fg-subtle` on `surface-2` in light, and on both
 * `surface` and `surface-2` in dark.
 *
 * Run: npm run check:contrast
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

/**
 * Pull `--name: #rrggbb;` out of the rule whose selector list starts a line.
 *
 * Anchored to a line start rather than a bare substring search: the text
 * `[data-theme="dark"]` also appears inside the `@custom-variant` declaration
 * at the top of the file, and matching that returned the *light* values for
 * both themes — the check passed while comparing light against itself.
 */
function tokens(selectorPattern) {
  const rule = new RegExp(`^${selectorPattern}[^{]*\\{([^}]*)\\}`, "m");
  const match = css.match(rule);
  if (!match) throw new Error(`No rule found for ${selectorPattern}`);

  const found = {};
  for (const [, name, value] of match[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    found[name] = value;
  }
  return found;
}

const hexToRgb = (hex) => hex.replace("#", "").match(/../g).map((x) => parseInt(x, 16));

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** accent-wash is an alpha overlay; flatten it against its own backdrop. */
const flatten = (fg, bg, alpha) =>
  "#" +
  hexToRgb(fg)
    .map((c, i) =>
      Math.round(c * alpha + hexToRgb(bg)[i] * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const AA = 4.5;
let failures = 0;

const themes = [
  ["light", tokens(":root,")],
  ["dark", tokens('\\[data-theme="dark"\\]')],
];

// Guard against the failure mode above: if both blocks parse to the same
// values, the selectors are wrong and the run proves nothing.
if (JSON.stringify(themes[0][1]) === JSON.stringify(themes[1][1])) {
  console.error("Light and dark parsed identically — selector matching is broken.");
  process.exit(1);
}

for (const [name, t] of themes) {
  const wash = flatten(t.accent, t.bg, 0.08);
  const surfaces = [
    ["bg", t.bg],
    ["surface", t.surface],
    ["surface-2", t["surface-2"]],
  ];

  const pairs = [];
  for (const [surfaceName, surface] of surfaces) {
    for (const fg of ["fg", "fg-muted", "fg-subtle", "accent"]) {
      pairs.push([`${fg} on ${surfaceName}`, t[fg], surface]);
    }
  }
  pairs.push(["accent on accent-wash", t.accent, wash]);
  pairs.push(["accent-contrast on accent-solid", t["accent-contrast"], t["accent-solid"]]);

  console.log(`\n${name}`);
  for (const [label, fg, bg] of pairs) {
    const ratio = contrast(fg, bg);
    const ok = ratio >= AA;
    if (!ok) failures += 1;
    console.log(`  ${ok ? "pass" : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1  ${label}`);
  }
}

if (failures) {
  console.error(`\n${failures} pair(s) below ${AA}:1`);
  process.exit(1);
}
console.log(`\nAll pairs clear WCAG AA (${AA}:1) in both themes.`);
