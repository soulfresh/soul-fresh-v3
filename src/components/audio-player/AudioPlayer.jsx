import React from "react";

export function AudioPlayer({ meta, links }) {
  if (!meta) return null;
  const src = `https://bandcamp.com/EmbeddedPlayer/album=${meta.id}/size=large/bgcol=ffffff/linkcol=000000/artwork=none/transparent=true/`;
  const bandcamp = links?.find((d) => d.url.includes("bandcamp"));
  return (
    <div
      className="album-image"
      style={{ backgroundImage: `url(${meta.img})` }}
    >
      <iframe
        className="bandcamp-album"
        style={{ border: 0 }}
        src={src}
        seamless="seamless"
        title="Bandcamp Album"
      ></iframe>
      {bandcamp && (
        <a href={bandcamp.url} target="_blank" rel="noopener noreferrer">
          {bandcamp.name}
        </a>
      )}
    </div>
  );
}
