"use client";

import styles from "./logo.module.scss";

/** A persistent error notice with a retry button; renders nothing without a message. */
export function ErrorToast({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  if (!message) return null;

  return (
    <div className={styles.toast} role="alert">
      <span>{message}</span>
      <button type="button" className={styles.action} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
