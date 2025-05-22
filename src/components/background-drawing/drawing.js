import $ from 'jquery';
import EventEmitter from 'eventemitter3';

export class Drawing {
  constructor(context) {
    this.context = context;
    this.className = 'drawing';
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  scroll(percent, pageHeight) {
    this.draw(percent);
  }

  draw() {}
}
