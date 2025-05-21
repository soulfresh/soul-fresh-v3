import React from "react";

export default function Contact({ meta }) {
  if (!meta) return null;
  return (
    <div className="contact-preview">
      <p className="big color-text">Call me...</p>
      {meta.available && (
        <p className="available">
          <span>Currently available for new projects</span>
        </p>
      )}
      <div name="cSlot"></div>
      <div className="social">
        {meta.linkedin && (
          <a
            className="linked-in color-text"
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
