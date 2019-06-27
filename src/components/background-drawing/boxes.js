import { Drawing } from './drawing';

export class BoxesDrawing extends Drawing {
  constructor(root, ids) {
    super(root, ids);
    this.className = 'rotating-boxes';
  }

  draw(percent) {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();

    const boxCount = 2;
    const boxW = Math.max(this.width, this.height/boxCount);
    const radius = (boxW * (1 + percent)) + (boxW * 0.5);
    const xShift = ((radius - this.width)/2) * -1;
    const yShift = ((radius * boxCount/2) - (this.height/2)) * -1;
    this.context.translate(xShift, yShift);

    for (let i = 0; i < boxCount; i++){
      const hue = (360 * percent + 90) % 360;
      this.context.strokeStyle = `hsla(${hue}, 100%, 60%, 1)`;

      const subBoxCount = 6;
      const lineW = (radius/2)/subBoxCount;
      const outerLineW = lineW/2;
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
        const rotation = ((value * Math.PI / 180) * 0.28) - 0.28;
        const centerX = (innerW / 2) + x;
        const centerY = (innerH / 2) + y;

        this.context.save();
        this.context.translate(centerX, centerY);
        this.context.rotate(rotation);
        this.context.translate(-centerX, -centerY);

        this.context.lineWidth = lineW * p;
        this.context.strokeRect(x, y, w, h);

        this.context.restore();
      }
    }

    this.context.restore();
  }
}
