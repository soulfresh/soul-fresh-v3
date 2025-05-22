import $ from 'jquery';
import 'mdn-polyfills/Array.from';
import EventEmitter from 'eventemitter3';
import { SizeAnimation } from '../size-animation';
import { selectors } from '../selectors';

const widths = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
}

export class Projects extends EventEmitter {
  constructor() {
    super();
  }

  init(root) {
    this.root = root;
    this.projects = $(this.root).find(selectors.project);

    const projects = Array.from(root[0].querySelectorAll(selectors.project));
    this.data = [];
    projects.forEach((p, i) => {
      this.data.push({
        id: p.getAttribute('id'),
        focused: false,
        container: p,
        preview: p.querySelector(selectors.preview),
        title: p.querySelector(selectors.projectTitle)
      });
    });
  }

  testFocus(bottom) {
    let found = false;

    this.data.forEach((project, i) => {
      let bounds = project.preview.getBoundingClientRect();
      let previewBottom = bounds.top + bounds.height * 0.3;

      if (bounds.top < 0) {
        this.projectHidden(i);
      } else if (previewBottom < bottom && !found) {
        this.projectFocused(i);
        found = true;
      } else if (project.focused) {
        this.projectHidden(i);
      }
    });
  }

  projectFocused(index) {
    const p = this.data[index];
    if (!p.focused) {
      p.focused = true;
      this.focus(index);
      this.emit('focused', index);
    }
  }

  projectHidden(index) {
    const p = this.data[index];
    if (p.focused) {
      p.focused = false;
      this.hide(index);
      this.emit('hidden', index);
    }
  }

  focus(index) {
    const p = this.data[index];
    requestAnimationFrame(() => {
      p.container.classList.add('focused');
      SizeAnimation.unroll($(p.title));
    });
  }

  hide(index) {
    const p = this.data[index];
    requestAnimationFrame(() => {
      p.container.classList.remove('focused');
      SizeAnimation.roll($(p.title));
    });
  }
}

