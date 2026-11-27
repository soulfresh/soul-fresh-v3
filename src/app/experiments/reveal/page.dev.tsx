import { visibleProjects } from "@/app/projects";

import { Placeholder } from "./Placeholder";
import { videoSize } from "./videoSize";
import styles from "./reveal.module.scss";

// Only projects with a video preview get a placeholder; the experience and
// contact entries aren't videos and will need their own treatment later.
const videoProjects = visibleProjects.filter((p) => p.preview?.type === "video");

export default function RevealExperiment() {
  return (
    <main className={styles.reveal}>
      <a href="/experiments">&larr; Experiments</a>
      <section className={styles.projects}>
        {videoProjects.map((project) => (
          <Placeholder
            key={project.id}
            name={project.name}
            {...videoSize(project)}
          />
        ))}
      </section>
    </main>
  );
}
