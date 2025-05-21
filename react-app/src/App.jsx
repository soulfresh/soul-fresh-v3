import React, { useEffect } from "react";
import projectsData from "../../src/data.json";
import Menu from "./components/Menu";
import Project from "./components/Project";
import { legacyInit } from "../../src/index.js";

// Sort and augment projects as in layout.pug
const projects = [...(projectsData.projects || [])];
projects.sort((a, b) => b.year - a.year);

if (!projects.find((p) => p.preview?.type === "experience")) {
  projects.push({
    id: "experience",
    name: "Me",
    year: "About",
    anchor: true,
    preview: {
      type: "experience",
      meta: projectsData.about,
    },
  });
}
if (!projects.find((p) => p.preview?.type === "contact")) {
  projects.push({
    id: "contact",
    name: "Me",
    year: "Contact",
    anchor: true,
    preview: {
      type: "contact",
    },
  });
}

function injectProjectColors(projects) {
  let styles = "";
  projects.forEach((p, i) => {
    const degrees = (360 / projects.length) * i;
    const hue = (degrees + 90) % 360;
    const color = `hsla(${hue}, 50%, 50%, 1)`;
    const light = `hsla(${hue}, 50%, 80%, 1)`;
    styles += `\n.${p.id}.color-text, .${p.id} .color-text { color: ${color}; }`;
    styles += `\n.${p.id}.color-background, .${p.id} .color-background { background-color: ${color}; }`;
    styles += `\n.${p.id}.color-background-light, .${p.id} .color-background-light { background-color: ${light}; }`;
  });
  let styleTag = document.getElementById("project-colors");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "project-colors";
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = styles;
}

export default function App() {
  const first = projects[0];

  useEffect(() => {
    injectProjectColors(projects);
    legacyInit();
  }, []);

  return (
    <div className="app-container">
      <header className="header" name="header">
        <h1 id="logo">
          <span className="container soul-container">
            <span className="soul">Soul</span>
          </span>
          <span className="container fresh-container">
            <span className="fresh">Fresh</span>
          </span>
        </h1>
        <Menu />
      </header>
      <div className={`subhead color-text ${first.id}`}>
        A software developer in Denver, CO
      </div>
      <main className="content" name="root">
        <section id="work" className="work">
          {projects.map(
            (project, i) =>
              (project.enabled === undefined || project.enabled === true) && (
                <Project key={project.id || i} project={project} />
              ),
          )}
        </section>
      </main>
    </div>
  );
}
