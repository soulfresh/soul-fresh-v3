// Google Fonts to try for each word. Every font is loaded at its default
// (400) weight.
export const soulFonts = [
  "Playfair Display",
  "Abril Fatface",
  "Pacifico",
  "Lobster",
  "Bebas Neue",
  "Righteous",
  "Monoton",
  "Bungee",
  "Cinzel",
  "Permanent Marker",
];

export const freshFonts = [
  "Archivo Black",
  "Montserrat",
  "Oswald",
  "Anton",
  "Comfortaa",
  "Fredoka",
  "Space Grotesk",
  "DM Serif Display",
  "Rubik Mono One",
  "Josefin Sans",
];

/** Google Fonts stylesheet URL that loads every font in both lists. */
export const fontsUrl =
  "https://fonts.googleapis.com/css2?" +
  [...new Set([...soulFonts, ...freshFonts])]
    .map((f) => `family=${f.replace(/ /g, "+")}`)
    .join("&") +
  "&display=swap";
