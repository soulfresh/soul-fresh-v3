import { fontsUrl } from "./fonts";
import styles from "./logo.module.scss";
import { Wordmark } from "./Wordmark";

export default function LogoExperiment() {
  return (
    <main className={styles.logo}>
      <link rel="stylesheet" href={fontsUrl} precedence="default" />
      <a href="/experiments">&larr; Experiments</a>
      <Wordmark />
    </main>
  );
}
