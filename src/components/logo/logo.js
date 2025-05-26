import EventEmitter from "eventemitter3";
import { selectors } from "../selectors";

export class Logo extends EventEmitter {
  init() {
    var count = 0;

    // TODO Ensure fonts have been applied to the document first.
    // this.logo = $(selectors.logo);
    this.logo = document.querySelector(selectors.logo);
    this.logo.addEventListener("animationend", () => {
      count++;
      if (count == 2) {
        this.emit("ready");
      }
    });

    requestAnimationFrame(() => {
      this.logo.classList.add("ready");
      // this.logo.css("display", "inline-flex");
    });
  }
}
