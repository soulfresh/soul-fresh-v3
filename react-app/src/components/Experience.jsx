import React from "react";

export default function Experience({ meta }) {
  if (!meta) return null;
  return (
    <div className="experience-preview">
      <div className="bio">
        <p className="hello color-text">Hello,</p>
        <p className="name">I'm Marc. I'm a software developer.</p>
        <p>{meta.bio}</p>
      </div>
      <div className="languages list">
        <b>Languages:</b> {meta.languages?.join(", ")}
      </div>
      <div className="frameworks list">
        <b>Frameworks:</b> {meta.frameworks?.join(", ")}
      </div>
      <div className="practices list">
        <b>Practices:</b> {meta.practices?.join(", ")}
      </div>
      <div className="technologies list">
        <b>Technologies:</b> {meta.technologies?.join(", ")}
      </div>
      <div className="software list">
        <b>Software:</b> {meta.software?.join(", ")}
      </div>
      <div className="social">
        {meta.github && (
          <a
            className="github color-text"
            href={meta.github}
            target="_blank"
            aria-label="GitHub"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github-square"></i>
          </a>
        )}
        {meta.linkedin && (
          <a
            className="linkedin color-text"
            href={meta.linkedin}
            target="_blank"
            aria-label="LinkedIn"
            rel="noopener noreferrer"
          >
            <i className="fab fa-linkedin"></i>
          </a>
        )}
      </div>
    </div>
  );
}
