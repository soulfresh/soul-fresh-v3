import { Drawing } from './drawing';

export class SolidTrianglesDrawing extends Drawing {
  constructor(context) {
    super(context);
    this.className = 'solid-triangles';
  }

  draw(percent) {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();

    const w = 150;
    const columns = Math.ceil(this.width / w);
    const h = w * 0.866; // Equilateral triangle
    const rows = Math.ceil(this.height / h);

    // console.log('dimensions w', this.width, 'h', this.height);
    // console.log('columns', columns, 'rows', rows);
    // console.log('triangle w', w, 'h', h);

    this.context.translate(0, h * -0.2);
    this.triangles(rows, columns, w, h, percent);

    this.context.restore();
  }

  triangles(rows, columns, w, h, percent) {
    this.context.save();
    // Because we are drawing triangles from their center,
    // move the drawing root over and down by half a triangle.
    this.context.translate(w/2, h/2);

    const max = 2;
    const maxW = w * max;
    const maxH = h * max;

    // linear easing (change/time/duration/beginingValue)
    // c*t/d + b;
    // const cp = percent * 2 - 1;
    const cp = percent;

    // -1 to 1
    const top = cp;
    // 1 to -1
    const bottom = 1 + cp * -1;

    // console.log('-----------------------------');
    // console.log('percent', percent, 'top', top, 'bottom', bottom);

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

      // console.log('w', w, 'percent', percent, 'rp', rp.toFixed(2), 'p', p);

      for (let j = 0; j < columns; j++) {
        const x = w * j;

        this.context.save();
        this.context.translate(x, y);

        this.triangle(tW, tH);
        this.context.fill();

        this.context.restore();
      }
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

    this.context.restore();
  }
}
