import styles from "./logo.module.scss";

export default function LogoExperiment() {
  return (
    <main className={styles.logo}>
      <a href="/experiments">&larr; Experiments</a>
      <div className={styles.stage}>
        <h1 className={styles.wordmark}>
          <span>Soul</span>
          <span>Fresh</span>
        </h1>
      </div>
    </main>
  );
}
