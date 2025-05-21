import React from "react";
import Preview from "./Preview";
import "./Project.scss";

export default function Project({ project }) {
  return (
    <div
      className={`project ${project.id}`}
      name="project"
      data-type={project.preview?.type}
      id={project.id}
    >
      <a name={project.id}></a>
      <div className="project-name color-background" name="name">
        <h2 className="text">{project.name}</h2>
      </div>
      <div className={`project-year color-text ${project.id}`} name="year">
        <h3>{project.year}</h3>
      </div>
      <Preview preview={project.preview} />
      {project.tools && project.tools.length > 0 && (
        <div className="project-tools" name="tools">
          <span className="animated-text">
            {project.tools.map((tool, i) =>
              i < project.tools.length - 1 ? `${tool}, ` : tool
            )}
          </span>
        </div>
      )}
      {project.clients && project.clients.length > 0 && (
        <div className="project-clients" name="clients">
          <span className="animated-text">
            <span className="bolder">Clients: </span>
            {project.clients.map((client, i) =>
              i < project.clients.length - 1 ? `${client}, ` : client
            )}
          </span>
        </div>
      )}
      {project.description && (
        <div className="description">
          <span className="animated-text">{project.description}</span>
        </div>
      )}
      {project.links && project.links.length > 0 && (
        <div className="project-links animated-text">
          {project.links.map((link, i) => (
            <a
              className="project-link color-text"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.name}
              key={i}
            >
              {link.icon ? (
                <>
                  <i className={link.icon}></i>
                  <span className="label">{link.name.split(' ')[0]}</span>
                </>
              ) : (
                <>Visit {link.name}</>
              )}
            </a>
          ))}
        </div>
      )}
      <div className="details">
        {project.company && (
          <div className="project-company" name="company">
            <span className="animated-text">{project.company}</span>
          </div>
        )}
        {project.positions && project.positions.length > 0 && (
          <div className="position" name="position">
            <span className="animated-text">
              {project.positions.map((pos, i) =>
                i < project.positions.length - 1 ? `${pos} / ` : pos
              )}
            </span>
          </div>
        )}
        {project.team && (
          <div className="team">
            <span className="animated-text">Team of {project.team}</span>
          </div>
        )}
      </div>
    </div>
  );
}
