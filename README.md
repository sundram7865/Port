# Portfolio: Sundram Mishra

Source for [port-l7q5.vercel.app](https://port-l7q5.vercel.app). Next.js 15 (App Router),
TypeScript, Tailwind v4, three.js via react-three-fiber.

## Why it is built this way

**Content is typed data, not JSX.** Everything the site says lives in `src/content` behind the
types in `src/content/types.ts`. A project cannot ship without its metrics, and a case study
cannot ship without its trade-offs section, because the type will not allow it.

**The 3D is the content.** `src/components/architecture` renders the real topologies of the three
systems in the case studies. The nodes, the edges and the flow are the architecture, not
decoration. Every node carries the engineering reason it exists.

**three.js is never in the initial bundle.** The WebGL scene is a `next/dynamic` chunk that only
loads when the section approaches the viewport and the visitor has not asked for reduced motion.
`controls.ts` is separate from `scene.tsx` precisely so importing the camera state does not drag
three into the first-load graph. Homepage First Load JS is ~116 kB.

**Everything degrades.** `static-diagram.tsx` renders the same graph as server-side SVG. That is
what ships with JavaScript disabled, what reduced-motion visitors keep, and what appears before the
canvas mounts, so the section is never blank and never shifts.

**One token system.** `globals.css` defines raw values on `:root` and `[data-theme="dark"]`, and
`@theme inline` maps Tailwind utilities onto those variables by reference. Light and dark come from
one definition. A blocking script in `<head>` resolves the theme before first paint.

## Local development

```bash
npm install
npm run dev              # http://localhost:3000
npm run check            # types, lint, contrast
npm run build

# Responsive and degradation checks, against a running build:
npm run build && npm start &
npm run check:visual     # BASE_URL / CHROME_PATH are configurable
```

## Structure

```
src/
  app/                 routes, metadata, sitemap, robots, generated OG image
  components/
    architecture/      3D explorer, scene, SSR SVG fallback, camera state
    ui.tsx             shared primitives
  content/             all site copy as typed data
  lib/                 hooks and the scene palette
```

## Accessibility and performance

- Semantic landmarks, one `h1` per page, skip link, visible focus ring on every interactive element.
- The 3D canvas is `aria-hidden`; the same graph is navigable as a list of buttons beside it.
- All motion, including the scene, is gated on `prefers-reduced-motion`.

Two things are checked rather than claimed, because neither shows up in a type
check, a lint pass or a Lighthouse run:

- `npm run check:contrast` parses the token values out of `globals.css` and
  asserts all 28 foreground/background pairs clear WCAG AA in **both** themes.
  Lighthouse only tests whichever theme a run resolved to, and returned 100
  while three pairs were failing.
- `npm run check:visual` drives the built site at 375 / 768 / 1440 in both
  themes and asserts no horizontal overflow, no console output, and that the
  WebGL scene acquires a context and projects every node label. It also checks that
  reduced-motion mounts no canvas and that the page still works with
  JavaScript disabled.

Lighthouse (mobile emulation) at the time of writing: home 98/100/100/100,
case study 99/100/100/100, note 96/100/100/100.
