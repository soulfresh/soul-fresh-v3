const startDegrees = 90;
const saturation = 50;
const brightness = 50;
const alpha = 1;

/**
 * A top-to-bottom gradient with `count` hues spread evenly around the color
 * wheel, ending on the first color so it loops back to where it started.
 */
export function rainbowGradient(count: number): string {
  const stops: string[] = [];

  for (let i = 0; i < count; i++) {
    const degrees = (360 / count) * i;
    const percent = Math.round((i / count) * 100);
    const hue = (degrees + startDegrees) % 360;
    stops.push(`${color(hue)} ${percent}%`);
  }

  stops.push(`${color(startDegrees)} 100%`);
  return `linear-gradient(180deg, ${stops.join(", ")})`;
}

function color(hue: number) {
  return `hsla(${hue}, ${saturation}%, ${brightness}%, ${alpha})`;
}
