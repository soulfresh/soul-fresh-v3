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
