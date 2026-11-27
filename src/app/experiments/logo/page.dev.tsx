import { BackgroundGradient } from "@/components/background-gradient";
import { visibleProjects } from "@/app/projects";

import { LogoBackground } from "./LogoBackground";
import styles from "./logo.module.scss";

export default function LogoExperiment() {
  return (
    <div className={styles.page}>
      <BackgroundGradient count={visibleProjects.length} />
      <LogoBackground />
      <main className={styles.logo}>
        <a href="/experiments">&larr; Experiments</a>
      </main>
    </div>
  );
}
