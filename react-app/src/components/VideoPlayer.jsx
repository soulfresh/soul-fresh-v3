import React from "react";

export default function VideoPlayer({ meta, src }) {
  if (!meta || !src) return null;
  // Use the first large video as the main source
  const poster = `/assets/poster-frames/${encodeURIComponent(meta.img)}`;
  const large = src.large?.[0] || "";
  // Try to extract width/height from filename, fallback to 16:9
  let width = 16, height = 9;
  const match = large.match(/(\d+)\s*x\s*(\d+)/);
  if (match) {
    width = parseInt(match[1], 10);
    height = parseInt(match[2], 10);
  }
  const ratio = (height / width) * 100;
  const style = {
    backgroundImage: `url(${poster})`,
    paddingTop: `${ratio}%`,
    backgroundSize: "cover",
    position: "relative",
  };
  return (
    <div className="video-container" name="videoContainer">
      <div className="play-video" name="playVideo">
        <span className="icon-wrapper">
          <i className="fas fa-play-circle play-icon color-background"></i>
        </span>
      </div>
      <div className="mute-video" name="muteVideo">
        <i className="fas fa-volume-mute color-text"></i>
      </div>
      <div style={style}>
        <img
          className="video-placeholder"
          name="videoPlaceholder"
          src={poster}
          data-poster={poster}
          alt="Video Poster"
        />
      </div>
    </div>
  );
}
