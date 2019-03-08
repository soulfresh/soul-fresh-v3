import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import { SizeAnimation } from './size-animation';

const selectors = {
  project: '[name=project]',
  title: '[name=name]', // TODO change selector to "title"
  preview: '[name=preview]',
}

export class Projects extends EventEmitter {
  constructor() {
    super();
  }

  init(root) {
    this.root = root;
    this.projects = $(this.root).find(selectors.project);
  }

  testFocus(bottom) {
    let found = false;

    for (let i = 0; i < this.projects.length; i++) {
      // Use the project element to track focus.
      let project = this.projects[i];
      // But use the preview bounds to determine what is considered "focused".
      let preview = project.querySelector(selectors.preview);
      let bounds = preview.getBoundingClientRect();
      let previewBottom = bounds.top + bounds.height;

      if (bounds.top < 0) {
        this.projectHidden(project, i);
      } else if (previewBottom < bottom && !found) {
        this.projectFocused(project, i);
        found = true;
      } else if (project.__focused) {
        this.projectHidden(project, i);
      // } else {
      //   // No need to look any further.
      //   return;
      }
    }
  }

  projectFocused(project, index) {
    if (!project.__focused) {
      project.__focused = true;
      this.focus(index);
      this.emit('focused', index);
    }
  }

  projectHidden(project, index) {
    if (project.__focused) {
      project.__focused = false;
      this.hide(index);
      this.emit('hidden', index);
    }
  }

  focus(index) {
    const project = this.projects[index];
    const title = project.querySelector(selectors.title);
    project.classList.add('focused');
    SizeAnimation.unroll($(title));
  }

  hide(index) {
    const project = this.projects[index];
    const title = project.querySelector(selectors.title);
    project.classList.remove('focused');
    SizeAnimation.roll($(title));
  }
}
