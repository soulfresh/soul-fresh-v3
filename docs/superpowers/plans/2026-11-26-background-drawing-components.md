# Background Drawing Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the jQuery/class-based background drawings with reusable React components (`BackgroundDrawing`, `DrawingSwitcher`) that size to their own box, and mount them on the home page without the logo gating.

**Architecture:** Each drawing becomes a plain TS module exporting `{ name, opacity, draw(ctx, width, height, percent) }`. `BackgroundDrawing` renders one `<canvas>` that fills its parent, keeps its buffer in sync with a `ResizeObserver` (DPR-aware), and redraws when `percent`/`drawing`/size change. `DrawingSwitcher` wraps it with shuffle + click-to-cycle. The home page gets a `HomeBackground` client component that feeds `useScrollPercent()` into `DrawingSwitcher` inside a fixed, fading wrapper.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), Sass CSS modules, Yarn 4.

**Spec:** `docs/superpowers/specs/2026-11-26-background-drawing-components-design.md`

## Global Constraints

- Drawing math is ported verbatim; visuals must not change (other than high-DPI sharpness).
- Default opacities: `sine-wave` 0.3, `rotating-boxes` 0.2, `solid-triangles` 0.2, `rotating-triangles` 0.5.
- `BackgroundDrawing` has no layout of its own and no fade-in animation.
- `Math.random()` must never run during render (hydration safety). `DrawingSwitcher` renders `null` until a post-mount effect sets the shuffled order.
- Home page layout: `position: fixed; top: 0; right: 0; width: 40%; height: 100vh; cursor: pointer`, 3s linear fade-in from opacity 0, `display: none` below 768px.
- Do not touch legacy modules in `src/app/init.ts` other than removing `DrawingSwitcher` usage.
- No test framework exists in this repo. Verification is `yarn lint` (runs `tsc --noEmit` + `next lint`), `yarn build`, and manual browser checks. Do not add a test framework.
- Baseline: `yarn lint` currently passes with "✔ No ESLint warnings or errors". Every task must leave it passing.

## File Structure

New (all under `src/components/background-drawing/` unless noted):

| File | Responsibility |
| --- | --- |
| `drawings/types.ts` | `DrawingName` union, `DrawingDefinition` interface |
| `drawings/sine-wave.ts` | Sine wave drawing |
| `drawings/boxes.ts` | Rotating boxes drawing |
| `drawings/rotating-triangles.ts` | Rotating triangles drawing |
| `drawings/solid-triangles.ts` | Solid triangles drawing |
| `drawings/index.ts` | `drawings` registry, `drawingNames`, type re-exports |
| `BackgroundDrawing.tsx` | Single canvas drawing component |
| `background-drawing.module.scss` | Canvas fill + opacity styles |
| `DrawingSwitcher.tsx` | Shuffle + click-to-cycle wrapper |
| `index.ts` | Folder exports (replaces `index.js`) |
| `src/components/dimensions/use-scroll-percent.ts` | `useScrollPercent()` hook |
| `src/app/HomeBackground.tsx` | Home page side-panel background |
| `src/app/home-background.module.scss` | Side-panel layout, fade-in, breakpoint |

Modified: `src/components/dimensions/index.ts`, `src/app/page.tsx`, `src/app/page.scss`, `src/app/init.ts`.

Deleted: `drawing.js`, `drawing-switcher.js`, `sine-wave.js`, `boxes.js`, `triangle-drawing.js`, `solid-triangles-drawing.js`, `index.js`, `background-drawing.scss` (all in `src/components/background-drawing/`).

Ordering note: the old `index.js` and the new `index.ts` must not coexist. Tasks 1–3 add new files next to the old ones without touching `index.js`. Task 4 swaps the index and deletes the old files in the same step as removing their last consumer (`init.ts`).

---

### Task 1: Drawing modules and registry

**Files:**
- Create: `src/components/background-drawing/drawings/types.ts`
- Create: `src/components/background-drawing/drawings/sine-wave.ts`
- Create: `src/components/background-drawing/drawings/boxes.ts`
- Create: `src/components/background-drawing/drawings/rotating-triangles.ts`
- Create: `src/components/background-drawing/drawings/solid-triangles.ts`
- Create: `src/components/background-drawing/drawings/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (from `src/components/background-drawing/drawings`):
  - `type DrawingName = "sine-wave" | "rotating-boxes" | "solid-triangles" | "rotating-triangles"`
  - `interface DrawingDefinition { name: DrawingName; opacity: number; draw(ctx: CanvasRenderingContext2D, width: number, height: number, percent: number): void }`
  - `const drawings: Record<DrawingName, DrawingDefinition>`
  - `const drawingNames: DrawingName[]`

- [ ] **Step 1: Create `drawings/types.ts`**

```ts
export type DrawingName =
  | "sine-wave"
  | "rotating-boxes"
  | "solid-triangles"
  | "rotating-triangles";

export interface DrawingDefinition {
  name: DrawingName;
  /** Default CSS opacity for the canvas while this drawing is shown. */
  opacity: number;
  /**
   * Draw a full frame. `width`/`height` are in CSS pixels and `percent` is
   * the 0–1 progress value driving the animation.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    percent: number,
  ): void;
}
```

- [ ] **Step 2: Create `drawings/sine-wave.ts`** (ported from `../sine-wave.js`)

```ts
import type { DrawingDefinition } from "./types";

export const sineWave: DrawingDefinition = {
  name: "sine-wave",
  opacity: 0.3,
  draw(ctx, width, height, percent) {
    ctx.clearRect(0, 0, width, height);

    const value = percent * 100;
    const sines = 20;
    const rotation = ((value * Math.PI) / 180) * 0.5;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    for (let i = 0; i < sines; i++) {
      ctx.beginPath();

      const growth = i * 0.5;
      const w = width * 3;
      const x = (value % 720) * (i * 0.5);
      const amplitude = height * 0.1;
      const frequency = width * 0.4;
      const ampWave = amplitude + i * growth * 4;
      const offsetX = -width * 0.7;
      const offsetY = height * 0.5;

      sine(ctx, x, w, ampWave, frequency, offsetX, offsetY);

      const hue = (360 * percent + 270) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 1)`;
      ctx.stroke();

      ctx.closePath();
    }

    ctx.restore();
  },
};

function sine(
  ctx: CanvasRenderingContext2D,
  value: number,
  w: number,
  amplitude: number,
  frequency: number,
  offsetX: number,
  offsetY: number,
) {
  const step = 60;
  const startX = value;
  let x = 0;
  let y = 0;

  while (x < w + step) {
    y = amplitude * Math.sin((x + startX) / frequency);
    ctx.lineTo(offsetX + x, offsetY + y);
    x += step;
  }
}
```

- [ ] **Step 3: Create `drawings/boxes.ts`** (ported from `../boxes.js`)

```ts
import type { DrawingDefinition } from "./types";

export const boxes: DrawingDefinition = {
  name: "rotating-boxes",
  opacity: 0.2,
  draw(ctx, width, height, percent) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    const boxCount = 2;
    const boxW = Math.max(width, height / boxCount);
    const radius = boxW * (1 + percent) + boxW * 0.5;
    const xShift = ((radius - width) / 2) * -1;
    const yShift = ((radius * boxCount) / 2 - height / 2) * -1;
    ctx.translate(xShift, yShift);

    for (let i = 0; i < boxCount; i++) {
      const hue = (360 * percent + 90) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 1)`;

      const subBoxCount = 6;
      const lineW = radius / 2 / subBoxCount;
      const outerLineW = lineW / 2;
      const startY = radius * i;

      for (let j = 0; j < subBoxCount; j++) {
        const j2 = subBoxCount - j;
        const innerW = (radius / subBoxCount) * j2;
        const innerH = (radius / subBoxCount) * j2;
        const w = innerW - lineW;
        const h = innerH - lineW;
        const innerX = lineW * j;
        const innerY = lineW * j;
        const x = innerX + outerLineW;
        const y = innerY + outerLineW + startY;
        let p = i % 2 === 0 ? percent : 1 - percent;
        p = Math.min(0.98, Math.max(0.02, p));

        const value = percent * 100;
        const rotation = ((value * Math.PI) / 180) * 0.28 - 0.28;
        const centerX = innerW / 2 + x;
        const centerY = innerH / 2 + y;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.translate(-centerX, -centerY);

        ctx.lineWidth = lineW * p;
        ctx.strokeRect(x, y, w, h);

        ctx.restore();
      }
    }

    ctx.restore();
  },
};
```

- [ ] **Step 4: Create `drawings/rotating-triangles.ts`** (ported from `../triangle-drawing.js`)

```ts
import type { DrawingDefinition } from "./types";

export const rotatingTriangles: DrawingDefinition = {
  name: "rotating-triangles",
  opacity: 0.5,
  draw(ctx, width, height, percent) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    const w = width * 0.7;
    const h = w * 0.866; // Equilateral triangle
    const y = height / 2 - w / 2;
    const x = width / 2 - h / 2;
    ctx.translate(x, y);

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 1;

    triangles(ctx, w, h, percent);

    ctx.restore();
  },
};

function triangles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  percent: number,
) {
  ctx.save();
  ctx.translate(w / 2, h / 2);

  const maxBackwardsRotation = -20;
  const backwardsRotation = maxBackwardsRotation * percent;
  const backwardsRadians = (Math.PI / 180) * backwardsRotation;
  ctx.rotate(backwardsRadians);

  const maxPercent = 0.45;
  const p = percent * maxPercent;
  const total = 30;
  for (let i = 0; i < total; i++) {
    ctx.save();

    const tPercent = (p / (total - 1)) * i;
    const degrees = tPercent * (360 * p);
    const radians = (Math.PI / 180) * degrees;

    ctx.rotate(radians);

    const step = p / (total - 1);
    const tP2 = step * i;
    const smallSize = 3;
    const largeSize = 3;
    const ls = 1 + largeSize * percent;
    const lW = w * ls;
    const lH = h * ls;
    const tW = lW - lW * smallSize * tP2;
    const tH = lH - lH * smallSize * tP2;

    triangle(ctx, tW, tH);

    ctx.restore();
  }

  ctx.restore();
}

function triangle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const t1 = { x: w / 2, y: 0 };
  const t2 = { x: w, y: h };
  const t3 = { x: 0, y: h };

  const centroidX = (t1.x + t2.x + t3.x) / 3;
  const centroidY = (t1.y + t2.y + t3.y) / 3;

  ctx.save();
  ctx.translate(centroidX * -1, centroidY * -1);

  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}
```

- [ ] **Step 5: Create `drawings/solid-triangles.ts`** (ported from `../solid-triangles-drawing.js`; `fillStyle` is intentionally left at the canvas default, black, as in the original)

```ts
import type { DrawingDefinition } from "./types";

export const solidTriangles: DrawingDefinition = {
  name: "solid-triangles",
  opacity: 0.2,
  draw(ctx, width, height, percent) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    const w = 150;
    const columns = Math.ceil(width / w);
    const h = w * 0.866; // Equilateral triangle
    const rows = Math.ceil(height / h);

    ctx.translate(0, h * -0.2);
    triangles(ctx, rows, columns, w, h, percent);

    ctx.restore();
  },
};

function triangles(
  ctx: CanvasRenderingContext2D,
  rows: number,
  columns: number,
  w: number,
  h: number,
  percent: number,
) {
  ctx.save();
  // Because we are drawing triangles from their center,
  // move the drawing root over and down by half a triangle.
  ctx.translate(w / 2, h / 2);

  const max = 2;
  const maxW = w * max;
  const maxH = h * max;

  const cp = percent;
  const top = cp;
  const bottom = 1 + cp * -1;

  for (let i = 0; i < rows; i++) {
    const y = i * h;

    // Percent for each row.
    let rp = i / (rows - 1);
    if (percent > 0.5) {
      rp = (rows - 1 - i) / (rows - 1);
    }
    const p = (top - bottom) * rp;

    const tW = maxW * p;
    const tH = maxH * p;

    for (let j = 0; j < columns; j++) {
      const x = w * j;

      ctx.save();
      ctx.translate(x, y);

      triangle(ctx, tW, tH);
      ctx.fill();

      ctx.restore();
    }
  }

  ctx.restore();
}

function triangle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const t1 = { x: w / 2, y: 0 };
  const t2 = { x: w, y: h };
  const t3 = { x: 0, y: h };

  const centroidX = (t1.x + t2.x + t3.x) / 3;
  const centroidY = (t1.y + t2.y + t3.y) / 3;

  ctx.save();
  ctx.translate(centroidX * -1, centroidY * -1);

  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.closePath();

  ctx.restore();
}
```

Note: the original builds the path inside `save()/restore()` and fills after `restore()`. Path coordinates are baked in when added, so this is equivalent. Keep the order as-is.

- [ ] **Step 6: Create `drawings/index.ts`**

```ts
import { boxes } from "./boxes";
import { rotatingTriangles } from "./rotating-triangles";
import { sineWave } from "./sine-wave";
import { solidTriangles } from "./solid-triangles";
import type { DrawingDefinition, DrawingName } from "./types";

export type { DrawingDefinition, DrawingName } from "./types";

export const drawings: Record<DrawingName, DrawingDefinition> = {
  "sine-wave": sineWave,
  "rotating-boxes": boxes,
  "solid-triangles": solidTriangles,
  "rotating-triangles": rotatingTriangles,
};

export const drawingNames = Object.keys(drawings) as DrawingName[];
```

- [ ] **Step 7: Verify**

Run: `yarn lint`
Expected: typecheck passes and "✔ No ESLint warnings or errors".

Also diff each new module against its `.js` source and confirm that apart from `this.context` → `ctx`, `this.width/height` → `width/height`, `let` → `const` where never reassigned, and removed commented-out `console.log` lines, the math is identical.

- [ ] **Step 8: Commit**

```bash
git add src/components/background-drawing/drawings
git commit -m "feat: port background drawings to typed drawing modules"
```

---

### Task 2: `BackgroundDrawing` and `DrawingSwitcher` components

**Files:**
- Create: `src/components/background-drawing/background-drawing.module.scss`
- Create: `src/components/background-drawing/BackgroundDrawing.tsx`
- Create: `src/components/background-drawing/DrawingSwitcher.tsx`

Do NOT create `src/components/background-drawing/index.ts` in this task (the old `index.js` is still there; Task 4 swaps them).

**Interfaces:**
- Consumes: `drawings`, `drawingNames`, `DrawingName` from `./drawings` (Task 1).
- Produces:
  - `BackgroundDrawing(props: BackgroundDrawingProps)` from `./BackgroundDrawing`, where
    `interface BackgroundDrawingProps { drawing: DrawingName; percent: number; className?: string; style?: React.CSSProperties; onClick?: React.MouseEventHandler<HTMLCanvasElement> }`
  - `DrawingSwitcher(props: DrawingSwitcherProps)` from `./DrawingSwitcher`, where
    `interface DrawingSwitcherProps { percent: number; className?: string; style?: React.CSSProperties }`

- [ ] **Step 1: Create `background-drawing.module.scss`**

```scss
.canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: var(--drawing-opacity, 1);
}
```

- [ ] **Step 2: Create `BackgroundDrawing.tsx`**

```tsx
"use client";

import React from "react";

import { drawings, type DrawingName } from "./drawings";
import styles from "./background-drawing.module.scss";

export interface BackgroundDrawingProps {
  drawing: DrawingName;
  /** 0–1 progress value driving the drawing. */
  percent: number;
  className?: string;
  /**
   * Inline styles for the canvas. Set `opacity` or `--drawing-opacity`
   * here to override the drawing's default opacity.
   */
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLCanvasElement>;
}

/**
 * Renders a single drawing on a canvas that fills its parent. Give the
 * parent a size; the canvas buffer follows it (scaled for high-DPI screens).
 */
export function BackgroundDrawing({
  drawing,
  percent,
  className,
  style,
  onClick,
}: BackgroundDrawingProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Hidden (e.g. display: none) or not measured yet.
    if (!canvas || !ctx || size.width === 0 || size.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const bufferW = Math.round(size.width * dpr);
    const bufferH = Math.round(size.height * dpr);
    if (canvas.width !== bufferW || canvas.height !== bufferH) {
      canvas.width = bufferW;
      canvas.height = bufferH;
    }
    // Drawings work in CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawings[drawing].draw(ctx, size.width, size.height, percent);
  }, [drawing, percent, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className ? `${styles.canvas} ${className}` : styles.canvas}
      style={
        {
          "--drawing-opacity": drawings[drawing].opacity,
          ...style,
        } as React.CSSProperties
      }
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 3: Create `DrawingSwitcher.tsx`**

```tsx
"use client";

import React from "react";

import { BackgroundDrawing } from "./BackgroundDrawing";
import { drawingNames, type DrawingName } from "./drawings";

export interface DrawingSwitcherProps {
  /** 0–1 progress value passed to the current drawing. */
  percent: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shows the drawings in a random order, moving to the next one on click.
 */
export function DrawingSwitcher({
  percent,
  className,
  style,
}: DrawingSwitcherProps) {
  // Shuffled after mount so server and hydration renders are both empty.
  const [order, setOrder] = React.useState<DrawingName[] | null>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setOrder(shuffle(drawingNames));
  }, []);

  if (!order) return null;

  return (
    <BackgroundDrawing
      drawing={order[index]}
      percent={percent}
      className={className}
      style={style}
      onClick={() => setIndex((i) => (i + 1) % order.length)}
    />
  );
}

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

- [ ] **Step 4: Verify**

Run: `yarn lint`
Expected: typecheck passes and "✔ No ESLint warnings or errors". (The components aren't mounted anywhere yet; browser checks happen in Task 4.)

- [ ] **Step 5: Commit**

```bash
git add src/components/background-drawing/BackgroundDrawing.tsx src/components/background-drawing/DrawingSwitcher.tsx src/components/background-drawing/background-drawing.module.scss
git commit -m "feat: add BackgroundDrawing and DrawingSwitcher components"
```

---

### Task 3: `useScrollPercent` hook

**Files:**
- Create: `src/components/dimensions/use-scroll-percent.ts`
- Modify: `src/components/dimensions/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `useScrollPercent(): number` exported from `@/components/dimensions` (and therefore `@/components`). Returns 0–1; 0 on the server and on first render.

- [ ] **Step 1: Create `use-scroll-percent.ts`**

Same math as `Dimensions.scrollPercent()` in `dimensions.js` (`pageYOffset / (html.scrollHeight - window height)`), clamped.

```ts
import React from "react";

/**
 * How far the page is scrolled, from 0 (top) to 1 (bottom). Updates at
 * most once per animation frame. Returns 0 until mounted.
 */
export function useScrollPercent(): number {
  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        setPercent(
          scrollable > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollable))
            : 0,
        );
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return percent;
}
```

- [ ] **Step 2: Export it from `src/components/dimensions/index.ts`**

The file currently contains only `export * from "./dimensions";`. Change it to:

```ts
export * from "./dimensions";
export * from "./use-scroll-percent";
```

- [ ] **Step 3: Verify**

Run: `yarn lint`
Expected: typecheck passes and "✔ No ESLint warnings or errors".

- [ ] **Step 4: Commit**

```bash
git add src/components/dimensions/use-scroll-percent.ts src/components/dimensions/index.ts
git commit -m "feat: add useScrollPercent hook"
```

---

### Task 4: Home page integration and legacy removal

**Files:**
- Create: `src/app/HomeBackground.tsx`
- Create: `src/app/home-background.module.scss`
- Create: `src/components/background-drawing/index.ts`
- Modify: `src/app/page.tsx` (inside `Home()`'s returned outer `<main>`)
- Modify: `src/app/page.scss:112` (remove the background-drawing `@import`)
- Modify: `src/app/init.ts` (lines 15, 60, 66, 79–80, 100, 121)
- Delete: `src/components/background-drawing/{drawing.js,drawing-switcher.js,sine-wave.js,boxes.js,triangle-drawing.js,solid-triangles-drawing.js,index.js,background-drawing.scss}`

**Interfaces:**
- Consumes: `BackgroundDrawing`, `DrawingSwitcher` (Task 2); `drawings`, `drawingNames`, `DrawingName`, `DrawingDefinition` (Task 1); `useScrollPercent` (Task 3).
- Produces: `HomeBackground()` from `src/app/HomeBackground.tsx`; the public folder exports from `@/components/background-drawing`.

- [ ] **Step 1: Swap the folder index and delete the old files**

From the repo root:

```bash
git rm src/components/background-drawing/{drawing.js,drawing-switcher.js,sine-wave.js,boxes.js,triangle-drawing.js,solid-triangles-drawing.js,index.js,background-drawing.scss}
```

Create `src/components/background-drawing/index.ts`:

```ts
export * from "./BackgroundDrawing";
export * from "./DrawingSwitcher";
export * from "./drawings";
```

- [ ] **Step 2: Remove the global SCSS import**

In `src/app/page.scss`, delete this line (currently line 112):

```scss
@import "../components/background-drawing/background-drawing";
```

- [ ] **Step 3: Remove `DrawingSwitcher` from `src/app/init.ts`**

Make exactly these edits:

1. In the `@/components` import list, delete the line `  DrawingSwitcher,`.
2. Change
   ```ts
   let projectsHelper: Projects, players: Players, drawing: DrawingSwitcher;
   ```
   to
   ```ts
   let projectsHelper: Projects, players: Players;
   ```
3. In `parallax`, delete `    drawing.scroll(scrolled);`.
4. In `start`, delete these two lines:
   ```ts
       drawing.init();
       log("[start] drawing initialized");
   ```
5. In `onResize`, delete `        drawing.resize();`.
6. In the `logo.once("ready", ...)` handler, delete `    drawing = new DrawingSwitcher($("body"));`.

Leave everything else (including `start()` and its `Contact` setup) unchanged.

- [ ] **Step 4: Create `src/app/home-background.module.scss`**

```scss
.homeBackground {
  position: fixed;
  top: 0;
  right: 0;
  width: 40%;
  height: 100vh;
  cursor: pointer;
  animation: fade-in 3s linear;

  @media (max-width: 767px) {
    display: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

- [ ] **Step 5: Create `src/app/HomeBackground.tsx`**

Import from the specific folders (not the `@/components` barrel) to keep the dependency explicit.

```tsx
"use client";

import { DrawingSwitcher } from "@/components/background-drawing";
import { useScrollPercent } from "@/components/dimensions";

import styles from "./home-background.module.scss";

/** Scroll-driven drawing in a fixed panel on the right side of the page. */
export function HomeBackground() {
  const percent = useScrollPercent();
  return (
    <div className={styles.homeBackground}>
      <DrawingSwitcher percent={percent} />
    </div>
  );
}
```

- [ ] **Step 6: Mount it in `src/app/page.tsx`**

Add the import next to the existing `Init` import:

```tsx
import { HomeBackground } from "./HomeBackground";
```

Render it as the first child of the outer `<main>` returned by `Home()`, before `<style id="project-colors">`. (The old code prepended the drawing to `<body>`, so it sat before all page content in the DOM; this keeps the same stacking.)

```tsx
    <main>
      <HomeBackground />
      <style id="project-colors">
```

- [ ] **Step 7: Static verification**

Run: `yarn lint`
Expected: typecheck passes and "✔ No ESLint warnings or errors".

Run: `grep -rn "DrawingSwitcher\|background-drawing" src/app`
Expected: only `src/app/HomeBackground.tsx` matches.

Run: `yarn build`
Expected: build completes without errors.

- [ ] **Step 8: Browser verification**

Run: `yarn start` and open http://localhost:3000 in a window wider than 768px. Check:

1. A drawing appears in the right 40% of the window and fades in over ~3s, right away on page load (not after the logo animation).
2. Scrolling redraws it smoothly, the same as on `main`.
3. Clicking it cycles through all four drawings, each at its expected faintness (rotating triangles noticeably stronger at 0.5).
4. Reloading a few times shows different starting drawings, with no hydration warnings in the console.
5. Narrowing below 768px hides it; widening again brings it back.
6. On a retina screen, the lines are sharp.

If a check fails, fix it before committing.

- [ ] **Step 9: Commit**

```bash
git add -A src/app src/components/background-drawing
git commit -m "feat: mount background drawing as React component on home page

Removes the jQuery DrawingSwitcher and the logo-ready gating."
```
