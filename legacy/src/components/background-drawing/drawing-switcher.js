import $ from 'jquery';

import { TriangleDrawing } from './triangle-drawing';
import { SolidTrianglesDrawing } from './solid-triangles-drawing';
import { SineWaveDrawing } from './sine-wave';
import { BoxesDrawing } from './boxes';

export class DrawingSwitcher {
  constructor(root, ids) {
    this.root = root;
    this.ids = ids;
    this.initialized = false;
    this.win = $(window);
    this.percent = 0;
  }

  visible() {
    // TODO Move this check into dimensions.
    return this.win.width() >= 768;
  }

  shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }


  init() {
    if (this.visible()) {
      this.container = $(`<div class="background-drawing" name="drawings"></div>`);
      const c = $('<canvas></canvas>');
      this.canvas = c[0];
      this.container.append(c);
      this.root.prepend(this.container);
      this.context = this.canvas.getContext('2d');
      this.container.on('click', this.click.bind(this));

      this.list = this.shuffle([
        new TriangleDrawing(this.context),
        new SolidTrianglesDrawing(this.context),
        new SineWaveDrawing(this.context),
        new BoxesDrawing(this.context)
      ]);
      this.index = 0;
      this.drawing = this.list[this.index];

      this.initialized = true;

      this.resize();
      requestAnimationFrame(() => this.switch(this.index));
    }
  }

  switch(index) {
    // Select the next drawing.
    this.drawing = this.list[index];

    // Update classes.
    this.list.forEach((d) => {
      this.container.removeClass(d.className);
    });
    this.container.addClass(this.drawing.className);

    // Redraw
    this.drawing.draw(this.percent);
  }

  click() {
    requestAnimationFrame(() => this.next());
  }

  next() {
    ++this.index;
    if (this.index >= this.list.length) {
      this.index = 0;
    }
    this.switch(this.index);
  }

  resize() {
    // TODO Remove when resized down.
    if (this.initialized && this.visible()) {
      this.width  = this.canvas.width  = this.canvas.parentElement.clientWidth;
      this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
      this.list.forEach((d) => d.resize(this.width, this.height));
    }
  }

  scroll(percent, pageHeight) {
    if (this.initialized && this.visible()) {
      this.percent = percent;
      this.drawing.draw(percent);
    }
  }
}
