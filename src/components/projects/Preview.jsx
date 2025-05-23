import React from "react";
import { Experience } from "../experience";
import { Contact } from "../contact";
import { AudioPlayer } from "../audio-player";
import { VideoPlayer } from "../video-player";

export default function Preview({ project }) {
  const preview = project.preview;
  if (!preview || !preview.type) return null;

  switch (preview.type) {
    case "video":
      return (
        <div className="project-preview video" name="preview" data-type="video">
          <VideoPlayer project={project} />
        </div>
      );
    case "music":
      return (
        <div className="project-preview music" name="preview" data-type="music">
          <AudioPlayer meta={preview.meta} links={preview.links} />
        </div>
      );
    case "slideshow":
      // TODO Implement slideshows
      return (
        <div
          className="project-preview slideshow"
          name="preview"
          data-type="slideshow"
        >
          Slideshow
        </div>
      );
    case "experience":
      return (
        <div
          className="project-preview experience"
          name="preview"
          data-type="experience"
        >
          <Experience meta={preview.meta} />
        </div>
      );
    case "contact":
      return (
        <div
          className="project-preview contact"
          name="preview"
          data-type="contact"
        >
          <Contact meta={preview.meta} />
        </div>
      );
    default:
      return null;
  }
}
