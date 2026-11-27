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
