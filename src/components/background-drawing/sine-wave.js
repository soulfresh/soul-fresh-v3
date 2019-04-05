import $ from 'jquery';

export class SineWaveDrawing {
  constructor(root, ids) {
    this.root = root;
    this.ids = ids;
    this.initialized = false;
    this.win = $(window);
  }

  visible() {
    // TODO Move this check into dimensions.
    return this.win.width() >= 768;
  }

  init() {
    if (this.visible()) {
      this.container = $('<div class="background-drawing sine-wave" name="sineWaveDrawing"></div>');
      const c = $('<canvas></canvas>');
      this.canvas = c[0];
      this.container.append(c);
      this.root.prepend(this.container);
      this.context = this.canvas.getContext("2d");
      this.resize();
      this.initialized = true;
    }
  }

  resize() {
    if (this.initialized && this.visible()) {
      this.width  = this.canvas.width  = this.canvas.parentElement.clientWidth;
      this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
    }
  }

  scroll(percent, pageHeight) {
    if (this.initialized && this.visible()) {
      this.draw(percent);
    }
  }

  draw(percent) {
    this.context.clearRect(0, 0, this.width, this.height);

    const value = percent * 100;
    const sines = 20;
    const rotation = (value * Math.PI / 180) * 0.5;
    const centerX = this.width/2;
    const centerY = this.height/2;

    this.context.save();
    this.context.translate(centerX, centerY);
    this.context.rotate(rotation);
    this.context.translate(-centerX, -centerY);

    for (let i = 0; i < sines; i++) {
      this.context.beginPath();

      const growth = i * 0.5;
      const w = this.width * 3;
      const x = (value % 720) * (i * 0.5);
      const amplitude = this.height * 0.1;
      const frequency = this.width * 0.4;
      const ampWave = amplitude + (i * growth * 4);
      const freqWave = frequency + (i * growth);
      const offsetX = -this.width * 0.7;
      const offsetY = this.height * 0.5;

      this.sine(x, w, ampWave, frequency, offsetX, offsetY);

      const hue = (360 * percent + 270) % 360;
      this.context.strokeStyle = `hsla(${hue}, 100%, 60%, 0.3)`;
      this.context.stroke();

      this.context.closePath();
    }

    this.context.restore();
  }

  sine(value, w, amplitude, frequency, offsetX, offsetY) {
    const step = 60;
    const startX = value;
    const startY = 0;
    let x = 0;
    let y = 0;

    while (x < w + step) {
      y = amplitude * Math.sin((x + startX)/frequency);
      this.context.lineTo(offsetX + x, offsetY + y);
      x += step;
    }
  }
}
