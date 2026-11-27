import { MorphPrototype } from "./MorphPrototype";
import styles from "./morph.module.scss";

export default function MorphExperiment() {
  return (
    <main className={styles.morph}>
      <a className={styles.back} href="/experiments">
        &larr; Experiments
      </a>
      <MorphPrototype />
    </main>
  );
}
