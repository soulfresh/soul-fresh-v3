import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import { selectors } from './selectors';

export class Logo extends EventEmitter {
  init() {
    // TODO Ensure fonts have been applied to the document first.
    this.logo = $(selectors.logo);
    this.logo.css('display', 'inline-flex');
    var count = 0;
    this.logo.on('animationend', () => {
      count++;
      if (count == 2) {
        this.emit('ready');
      }
    });
  }
}
