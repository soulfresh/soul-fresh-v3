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
