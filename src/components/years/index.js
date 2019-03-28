import $ from 'jquery';
import { selectors } from '../selectors';

export class Years {
  constructor(root) {
    this.root = root;
    this.container = $('<div name="years" class="years"></div>');
    this.years = $(selectors.year);
    this.ratio = 0.25;
    this.projects = $(selectors.project);
  }

  init() {
    this.years.appendTo(this.container);
    this.root.prepend(this.container);
    this.resize();
  }

  resize() {
    // Resize years to be a factor of their project height.
    this.projects.each((i) => {
      this.years.eq(i).height(
        this.projects.eq(i).outerHeight() * this.ratio
      );
    });
  }

  focus(i) {
    for (let j = 0; j < this.years.length; j++) {
      if (j === i) {
        this.years.eq(j).addClass('focused');
      } else {
        this.unfocus(j);
      }
    }
  }

  unfocus(i) {
    this.years.eq(i).removeClass('focused');
  }

  scroll(scrolled, scrollHeight) {
    const yMove = (scrollHeight * scrolled) * this.ratio;
    this.container.css('transform', `translateY(-${yMove}px)`);
  }
}
