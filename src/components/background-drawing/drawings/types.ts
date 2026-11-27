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
