import $ from 'jquery';
import { selectors } from '../selectors';

export class Menu {
  constructor(root) {
    this.root = root;
    this.button = this.root.find(selectors.menu);
    this.links = this.root.find(selectors.menuItem);
    this._open = false;
  }

  init() {
    this.button.on('click', () => {
      if (!this._open) {
        this.open();
      } else {
        this.close();
      }
    });

    this.links.on('click', (e) => {
      const link = $(e.currentTarget).attr('href').split('#')[1];
      const target = $(`[name='${link}']`);
      target[0].scrollIntoView({behavior: 'smooth'});
      this.close();
      return false;
    });

    this.links.css('transition-delay', (i) => `${(this.links.length - i) * 60}ms`);
  }

  open() {
    this._open = true;
    this.root.addClass('menu-open');
  }

  close() {
    if (this._open) {
      this._open = false;
      this.root.removeClass('menu-open');
    }
  }
}
