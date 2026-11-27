import { Project, Menu } from "@/components";
import { BackgroundGradient } from "@/components/background-gradient";
import { Init } from "./init";
import { HomeBackground } from "./HomeBackground";

import "./page.scss";
import { projects, visibleProjects } from "./projects";

export default function Home() {
  const first = projects[0];

  return (
    <main className="page">
      <BackgroundGradient count={visibleProjects.length} />
      <HomeBackground />
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
          A software developer in Washington, DC
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
