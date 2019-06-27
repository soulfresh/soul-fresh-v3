import { Drawing } from './drawing';

export class TriangleDrawing extends Drawing {
  constructor(root, ids) {
    super(root, ids);
    this.className = 'rotating-triangles';
  }

  draw(percent) {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();

    const w = this.width * 0.7;
    const h = w * 0.866; // Equilateral triangle
    const y = this.height / 2 - w / 2;
    const x = this.width / 2 - h / 2;
    this.context.translate(x, y);

    this.context.strokeStyle = '#ff00ff';
    this.context.lineWidth = 1;

    this.triangles(w, h, percent);

    this.context.restore();
  }

  triangles(w, h, percent) {
    this.context.save();
    this.context.translate(w/2, h/2);

    const maxBackwardsRotation = -20;
    const backwardsRotation = maxBackwardsRotation * percent;
    const backwardsRadians = (Math.PI / 180) * backwardsRotation;
    this.context.rotate(backwardsRadians);

    const maxPercent = 0.45;
    const p = percent * maxPercent;
    const total = 30;
    for (let i = 0; i < total; i++) {
      this.context.save();

      const tPercent = (p / (total - 1)) * i;
      const degrees = tPercent * (360 * p);
      const radians = (Math.PI/180) * degrees;

      this.context.rotate(radians);

      let step = (p / (total - 1));
      let tP2 = step * i;
      let smallSize = 3;
      let largeSize = 3;
      let ls = 1 + largeSize * percent;
      let lW = w * ls;
      let lH = h * ls;
      let tW = lW - (lW * smallSize * tP2);
      let tH = lH - (lH * smallSize * tP2);

      this.triangle(tW, tH);

      this.context.restore();
    }

    this.context.restore();
  }

  triangle(w, h) {
    const t1 = {
      x: w/2,
      y: 0
    }
    const t2 = {
      x: w,
      y: h
    }
    const t3 = {
      x: 0,
      y: h
    }

    const centroidX = (t1.x + t2.x + t3.x) / 3;
    const centroidY = (t1.y + t2.y + t3.y) / 3;

    this.context.save();
    this.context.translate(centroidX * -1, centroidY * -1);

    // this.context.strokeRect(0, 0, w, h);
    this.context.beginPath();
    this.context.moveTo(t1.x, t1.y);
    this.context.lineTo(t2.x, t2.y);
    this.context.lineTo(t3.x, t3.y);
    this.context.closePath();
    this.context.stroke();

    this.context.restore();
  }
}
