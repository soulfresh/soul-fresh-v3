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
