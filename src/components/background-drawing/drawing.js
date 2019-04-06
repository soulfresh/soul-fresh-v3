import $ from 'jquery';

export class Drawing {
  constructor(root, ids) {
    this.root = root;
    this.ids = ids;
    this.initialized = false;
    this.win = $(window);
    this.alpha = 0.05;
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

  draw() {}
}
