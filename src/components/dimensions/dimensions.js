import $ from "jquery";
import { selectors } from "../selectors";

export class Dimensions {
  constructor() {
    this.html = $("html");
    this.projects = $(selectors.project);
    this.header = $(selectors.header);
    this.update();
  }

  scrollPercent() {
    // return this.html.scrollTop() / this.scrollH;
    return window.pageYOffset / this.scrollH;
  }

  update() {
    const windowH = $(window).height();
    const lastH = this.projects.last().outerHeight();
    const headerH = this.header.outerHeight();

    this.pageH = this.html[0].scrollHeight;
    this.viewportH = windowH;
    this.scrollH = this.pageH - this.viewportH;
  }
}
