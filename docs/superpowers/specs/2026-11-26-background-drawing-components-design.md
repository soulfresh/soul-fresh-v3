# Background Drawing Components — Design

**Date:** 2026-11-26
**Status:** Approved in brainstorming, awaiting spec review

## Goal

Convert the jQuery/class-based background drawings in
`src/components/background-drawing/` into React components with co-located
CSS, so a drawing can be reused anywhere (the home page side panel, a
full-window background, etc.). Remove the "wait for logo to finish" gating.

## Non-goals

- Changing how any drawing looks (aside from becoming sharp on high-DPI screens).
- Touching other legacy modules in `src/app/init.ts`.
- Adding an experiments/demo page.
- Adding a test framework.

## Components and files

All in `src/components/background-drawing/`, written in TS/TSX.

### `drawings/*.ts`

One module per drawing: `sine-wave.ts`, `boxes.ts`, `rotating-triangles.ts`,
`solid-triangles.ts`. Each exports a `DrawingDefinition`:

```ts
export interface DrawingDefinition {
  name: DrawingName;
  opacity: number;
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, percent: number): void;
}
```

Drawing math is ported verbatim from the current classes, with
`this.context`/`this.width`/`this.height` becoming arguments and helper
methods (`sine`, `triangle`, `triangles`) becoming module-level functions.

Default opacities (from the current SCSS):

| name                 | opacity |
| -------------------- | ------- |
| `sine-wave`          | 0.3     |
| `rotating-boxes`     | 0.2     |
| `solid-triangles`    | 0.2     |
| `rotating-triangles` | 0.5     |

`drawings/index.ts` exports a `drawings` registry
(`Record<DrawingName, DrawingDefinition>`), the `DrawingName` union type,
and a `drawingNames` array.

### `BackgroundDrawing.tsx` (client component)

```ts
interface BackgroundDrawingProps {
  drawing: DrawingName;
  percent: number; // 0–1
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLCanvasElement>;
}
```

- Renders a single `<canvas>`. No layout of its own: it fills whatever box
  its parent gives it.
- `background-drawing.module.scss`: `display: block; width: 100%;
  height: 100%; opacity: var(--drawing-opacity)`. The component sets
  `--drawing-opacity` from the drawing's default as an inline style;
  callers override it via `style` (`opacity` or `--drawing-opacity`).
- No fade-in animation (that belongs to the consumer).
- A `ResizeObserver` on the canvas sets the backing buffer to
  `clientWidth/clientHeight × devicePixelRatio` and scales the context by
  `devicePixelRatio`, so drawings keep working in CSS pixels.
- Redraws whenever `percent`, `drawing`, or the observed size changes.
- If the measured size is 0×0 (e.g. hidden with `display: none`), it skips
  drawing.

### `DrawingSwitcher.tsx` (client component)

```ts
interface DrawingSwitcherProps {
  percent: number;
  className?: string;
  style?: React.CSSProperties;
}
```

- Holds a shuffled order of `drawingNames` plus the current index. The
  order starts as `null` and a `useEffect` sets the shuffled order after
  mount. While it is `null` the component renders nothing, so the server
  render and the client's hydration render are both `null` (no hydration
  mismatch, since `Math.random()` never runs during render), and no
  unshuffled drawing is ever painted. A canvas has no server-rendered
  content, so the delay costs nothing.
- Clicking moves to the next drawing, wrapping around.
- Renders `<BackgroundDrawing>`, passing `className`/`style` through.

### `index.ts`

Exports `BackgroundDrawing`, `DrawingSwitcher`, `drawings`,
`drawingNames`, and the `DrawingName`/`DrawingDefinition` types.

### Removed

- `drawing.js`, `drawing-switcher.js`, `sine-wave.js`, `boxes.js`,
  `triangle-drawing.js`, `solid-triangles-drawing.js`, `index.js`
- `background-drawing.scss` and its `@import` in `src/app/page.scss`

## Home page integration

### `useScrollPercent()` hook

Lives in `src/components/dimensions/`. Returns
`window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`,
clamped to 0–1, and 0 when nothing can scroll. Updates through a passive
`scroll` listener using `requestAnimationFrame`, and also recalculates on
`resize`. Returns 0 on the server and on first render.

### `HomeBackground.tsx` (client component, `src/app/`)

```tsx
const percent = useScrollPercent();
return <DrawingSwitcher percent={percent} className={styles.homeBackground} />;
```

`home-background.module.scss` takes over the old layout:
`position: fixed; top: 0; right: 0; width: 40%; height: 100vh;
cursor: pointer`, a 3s linear fade-in from opacity 0 on mount
(`@keyframes`), and `display: none` below 768px.

Note: `className` lands on the canvas itself, so the fade's opacity
animation would fight with `--drawing-opacity`. To avoid that, the fade
and positioning go on a wrapper `<div>` in `HomeBackground`, and the
canvas fills that wrapper. The wrapper's opacity multiplies with the
canvas's, so the fade ends at each drawing's tuned opacity.

`src/app/page.tsx` renders `<HomeBackground />` inside `<main>`.

### `src/app/init.ts`

Remove everything about `DrawingSwitcher`: the import, the `drawing`
variable, `drawing.init()`, `drawing.scroll()`, `drawing.resize()`, and its
construction inside `logo.once("ready")`. Other legacy modules stay as
they are.

## Behavior changes

- The drawing shows up on page load instead of after the logo animation.
- Visibility below 768px is handled with CSS, so widening the window past
  768px after load now shows the drawing (previously it never appeared).
- Canvas renders sharply on high-DPI screens.
- Click-to-cycle and the 3s fade-in work the same as before.

## Verification

No test framework exists. Verify with:

- `yarn lint` (runs typecheck + next lint) and `yarn build`
- In the browser (`yarn start`): side panel shows a drawing, fades in,
  redraws on scroll, cycles on click, hides below 768px and comes back
  when widened, and looks sharp on retina.
