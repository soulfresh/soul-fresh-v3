import $ from 'jquery';
import { selectors } from '../selectors';

export class Boxes {
  constructor(root, ids, ratio=1) {
    this.root = root;
    this.ids = ids;
    this.ratio = ratio;
  }

  createBoxes(name, classes) {
    this.ids.forEach((id) => {
      this.container.append(
        `<div name="${name}" class="${id} ${classes}"></div>`
      );
    });
    this.boxes = this.container.find(`[name=${name}]`);
  }

  init() {}
  scroll(scrolled, scrollHeight) {}
  resize() {}
}

export class LeftColors extends Boxes {
  constructor(root, ids, ratio=1.1) {
    super(root, ids, ratio);
  }

  init() {
    this.container = $('<div name="colorBoxes" class="colors"></div>');
    this.root.prepend(this.container);
    if (!this.initialized) {
      this.createBoxes('colorBox', 'color-box color-background');
      this.initialized = true;
    }
  }

  scroll(scrolled, scrollHeight, viewportH) {
    // TODO Optimize this to only measure on resize.
    const boxesH = this.container.outerHeight();
    const bMove = (boxesH - viewportH) * scrolled;
    this.container.css('transform', `translateY(-${bMove}px)`);
  }
}

export class RightColors extends Boxes {
  constructor(root, ids, ratio=1.5) {
    super(root, ids, ratio);
  }

  init() {
    this.projects = $(selectors.project);
    this.container = $(
      '<div name="descriptionBoxes" class="description-boxes"></div>'
    );
    this.root.append(this.container);
    if (!this.initialized) {
      this.createBoxes('descriptionBox', 'description-box color-background');
      this.initialized = true;
    }
  }

  scroll(scrolled, scrollHeight) {
    const dMove = (scrollHeight * scrolled) * this.ratio;
    this.container.css('transform', `translateY(-${dMove}px)`);
  }

  resize() {
    this.projects.each((i) => {
      let h = this.projects.eq(i).outerHeight() * this.ratio;
      if (i === this.projects.length - 1) {
        // Add the bottom padding.
        const lastH = this.projects.last().outerHeight();
        const headerH = $( selectors.header ).outerHeight();
        const bottomPadding = $(window).height() - lastH - headerH;
        h += bottomPadding;
      }
      this.boxes.eq(i).height(h);
    });
  }
}
