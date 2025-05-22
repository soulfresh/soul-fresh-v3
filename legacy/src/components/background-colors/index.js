import $ from 'jquery';

export class BackgroundColors {
  constructor(root, ids) {
    this.root = root;
    this.ids = ids;
    this.startDegrees = 90;
    this.spread = 20;
  }

  init() {
    const saturation = 50;
    const brightness = 50;
    const alpha = 1;
    const stops = [];
    const total = this.ids.length;
    let bgColor, last;

    for (let i = 0; i < total; i++) {
      const degrees = (360 / total) * i;
      const percent = Math.round((i / total) * 100);
      const hue = (degrees + this.startDegrees) % 360;
      const color = `hsla(${hue}, ${saturation}%, ${brightness}%, ${alpha})`;
      stops.push(`${color} ${percent}%`);

      if (i === 0) {
        bgColor = color;
        last = `${color} 100%`;
      }
    }

    stops.push(last);
    const gradient = `linear-gradient(180deg, ${stops.join(', ')})`;

    $('html').css('background-color', bgColor);
    $('body').css('background', gradient);
  }
}
