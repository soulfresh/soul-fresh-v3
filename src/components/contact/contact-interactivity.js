export class ContactInteractivity {
  constructor(root, address) {
    const hp = window.location.hostname.split("www.");
    const h = hp.length === 1 ? hp[0] : hp[1];
    const a = `${address}@${h}`;
    const p = "mailto";
    root.append(
      `<p><a class="do-it" href="${p}:${a}" target="blank" rel="noopener noreferrer">${a}</a></p>`,
    );
  }
}
