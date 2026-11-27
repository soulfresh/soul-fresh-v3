import { BackgroundGradient } from "@/components/background-gradient";
import { visibleProjects } from "@/app/projects";

import { FullWindowDrawing } from "../FullWindowDrawing";

import { StretchPrototype } from "./StretchPrototype";
import styles from "./stretch.module.scss";

export default function StretchExperiment() {
  return (
    <div className={styles.page}>
      <BackgroundGradient count={visibleProjects.length} />
      <FullWindowDrawing />
      <main className={styles.stretch}>
        <a href="/experiments">&larr; Experiments</a>
        <StretchPrototype />
      </main>
    </div>
  );
}
