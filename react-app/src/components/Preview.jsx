import React from "react";
import Experience from "./Experience";
import Contact from "./Contact";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";

export default function Preview({ preview }) {
  if (!preview || !preview.type) return null;

  switch (preview.type) {
    case "video":
      return <div className="project-preview video"><VideoPlayer meta={preview.meta} src={preview.src} /></div>;
    case "music":
      return <div className="project-preview music"><AudioPlayer meta={preview.meta} links={preview.links} /></div>;
    case "slideshow":
      // TODO: Implement slideshow preview
      return <div className="project-preview slideshow">Slideshow Preview</div>;
    case "experience":
      return <div className="project-preview experience"><Experience meta={preview.meta} /></div>;
    case "contact":
      return <div className="project-preview contact"><Contact meta={preview.meta} /></div>;
    default:
      return null;
  }
}
