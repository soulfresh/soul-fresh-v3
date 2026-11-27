import { visibleProjects } from "@/app/projects";
import { BackgroundGradient } from "@/components/background-gradient";

import { FullWindowDrawing } from "../FullWindowDrawing";

import { RevealPrototype, type RevealItem } from "./RevealPrototype";
import { posterFrame, videoSources } from "./videoSources";
import { videoSize } from "./videoSize";
import styles from "./reveal.module.scss";

// Only projects with a video preview get a placeholder; the experience and
// contact entries aren't videos and will need their own treatment later.
const items: RevealItem[] = visibleProjects
  .filter((p) => p.preview?.type === "video")
  .map((p) => ({
    id: p.id,
    name: p.name,
    ...videoSize(p),
    sources: videoSources(p),
    poster: posterFrame(p),
  }));

export default function RevealExperiment() {
  return (
    <div className={styles.page}>
      <BackgroundGradient count={visibleProjects.length} />
      <FullWindowDrawing />
      <main className={styles.reveal}>
        <a href="/experiments">&larr; Experiments</a>
        <RevealPrototype items={items} />
      </main>
    </div>
  );
}
