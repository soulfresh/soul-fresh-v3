import styles from "./experiments.module.scss";

// Add new experiments here. Each experiment lives in its own folder
// with a `page.dev.tsx` so it is only available during development.
const experiments = [
  { slug: "logo", name: "Logo" },
  { slug: "stretch", name: "Stretch" },
  { slug: "reveal", name: "Reveal" },
];

export default function Experiments() {
  return (
    <main className={styles.experiments}>
      <h1>Experiments</h1>
      <ul>
        {experiments.map((e) => (
          <li key={e.slug}>
            {/* Plain anchors force a full page load so global styles and
                scripts from other pages don't leak into experiments. */}
            <a href={`/experiments/${e.slug}`}>{e.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
