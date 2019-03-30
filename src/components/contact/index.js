import $ from 'jquery';

export class Contact {
  constructor(root, address) {
    const a = `${address}@${window.location.hostname}`;
    const p = 'mailto';
    root.append(`<p><a class="do-it" href="${p}:${a}" target="blank">${a}</a></p>`);
  }
}
