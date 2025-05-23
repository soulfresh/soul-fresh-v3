import React from "react";

export function VideoPlayer({ project, meta, src }) {
  var root = "https://storage.googleapis.com/soul-fresh-com-videos";
  var image = encodeURIComponent(project.preview.meta.img);
  var poster = `/poster-frames/${image}`;
  var sources = project.preview.src;
  // var large = sources.large[0];
  // var parts = large.split(" x ");
  // var partsL = parts[0].trim().split(" ");
  // var partsR = parts[1].trim().split(" ");
  // var width = parseInt(partsL[partsL.length - 1], 10);
  // var height = parseInt(partsR[0], 10);
  // var ratio = (height / width) * 100;

  // var style = `background-image: url(${poster});`;
  // style += `padding-top: ${ratio}%;`;
  // style += "background-size: cover;";

  // if (!meta || !src) return null;
  // // Use the first large video as the main source
  // const poster = `/poster-frames/${encodeURIComponent(meta.img)}`;
  // const large = src.large?.[0] || "";
  // // Try to extract width/height from filename, fallback to 16:9
  // let width = 16,
  //   height = 9;
  // const match = large.match(/(\d+)\s*x\s*(\d+)/);
  // if (match) {
  //   width = parseInt(match[1], 10);
  //   height = parseInt(match[2], 10);
  // }
  // // const ratio = (height / width) * 100;
  // const style = {
  //   backgroundImage: `url(${poster})`,
  //   // paddingTop: `${ratio}%`,
  //   backgroundSize: "cover",
  //   position: "relative",
  // };
  return (
    <div className="video-container" name="videoContainer">
      <div className="play-video" name="playVideo">
        <span className="icon-wrapper">
          <i className="fas fa-play-circle play-icon color-background"></i>
          <svg className="loader color-text" viewBox="0 0 100 100">
            <rect className="background" x="0" y="0" width="100" height="100" />
            <circle className="dashes" cx="50" cy="50" r="30" />
          </svg>
        </span>
      </div>
      <div className="mute-video" name="muteVideo">
        <i className="fas fa-volume-mute color-text"></i>
      </div>
      <img
        className="video-placeholder"
        name="videoPlaceholder"
        src={poster}
        data-poster={poster}
        // alt="Video Poster"
        data-id={project.id}
        data-root={root}
        data-large={sources.large.join("||")}
        data-small={sources.small.join("||")}
      />
    </div>
  );
}
