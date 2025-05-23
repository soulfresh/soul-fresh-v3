export class Drawing {
  constructor(context) {
    this.context = context;
    this.className = "drawing";
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  scroll(percent) {
    this.draw(percent);
  }

  draw() {}
}
