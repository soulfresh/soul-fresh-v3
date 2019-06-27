import $ from 'jquery';

export class Contact {
  constructor(root, address) {
    const h = window.location.hostname.split('www.')[1];
    const a = `${address}@${h}`;
    const p = 'mailto';
    root.append(`<p><a class="do-it" href="${p}:${a}" target="blank" rel="noopener noreferrer">${a}</a></p>`);
  }
}
