import { Project, Menu } from "@/components";
import { Init } from "./init";

import "./page.scss";
import { data as projectsData } from "./data";

// Sort and augment projects as in layout.pug
const projects = [...(projectsData.projects || [])];
projects.sort((a, b) => Number(b.year) - Number(a.year));

if (!projects.find((p) => p.preview?.type === "experience")) {
  projects.push({
    id: "experience",
    name: "Me",
    year: "About",
    preview: {
      type: "experience",
      meta: projectsData.about,
    },
    description: "",
    tools: [],
    color: "",
    company: "",
    positions: [],
    clients: [],
    links: [],
  });
}
if (!projects.find((p) => p.preview?.type === "contact")) {
  projects.push({
    id: "contact",
    name: "Me",
    year: "Contact",
    preview: {
      type: "contact",
    },
    description: "",
    tools: [],
    color: "",
    company: "",
    positions: [],
    clients: [],
    links: [],
  });
}

export default function Home() {
  const first = projects[0];

  return (
    <main>
      <style id="project-colors">
        {projects
          .map((p, i) => {
            const degrees = (360 / projects.length) * i;
            const hue = (degrees + 90) % 360;
            const color = `hsla(${hue}, 50%, 50%, 1)`;
            const light = `hsla(${hue}, 50%, 80%, 1)`;
            return `
            .${p.id}.color-text, .${p.id} .color-text { color: ${color}; }
            .${p.id}.color-background, .${p.id} .color-background { background-color: ${color}; }
            .${p.id}.color-background-light, .${p.id} .color-background-light { background-color: ${light}; }
          `;
          })
          .join("\n")}
      </style>
      <div className="app-container">
        <Init />
        <header className="header" id="header">
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
        <main className="content" id="root">
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
    </main>
  );
}
