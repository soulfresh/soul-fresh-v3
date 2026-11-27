import styles from "./logo.module.scss";
import { Wordmark } from "./Wordmark";

export default function LogoExperiment() {
  return (
    <main className={styles.logo}>
      <a href="/experiments">&larr; Experiments</a>
      <Wordmark />
    </main>
  );
}
