import $ from 'jquery';

export class Dimensions {
  constructor() {
    this.html = $('html');
    this.update();
  }

  scrollPercent() {
    // return this.html.scrollTop() / this.scrollH;
    return window.pageYOffset / this.scrollH;
  }

  update() {
    this.pageH = this.html[0].scrollHeight;
    this.viewportH = $(window).height();
    this.scrollH = this.pageH - this.viewportH;
    // console.log(`dimensions: page = ${this.pageH} viewport = ${this.viewportH} scrollable height = ${this.scrollH}`);
  }
}

// TODO export this if we need an singleton.
// export const dimensions = new Dimensions();

