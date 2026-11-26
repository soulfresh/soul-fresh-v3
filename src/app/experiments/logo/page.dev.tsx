import styles from "./logo.module.scss";

export default function LogoExperiment() {
  return (
    <main className={styles.logo}>
      <a href="/experiments">&larr; Experiments</a>
    </main>
  );
}
