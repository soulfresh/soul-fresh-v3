"use client";

import React from "react";

import styles from "./logo.module.scss";

/**
 * The fixed controls panel. A header button collapses it to just the
 * header, and it collapses by itself while `avoid` (the saved grid) scrolls
 * up into the space it would occupy when expanded.
 */
export function ControlsPanel({
  avoid,
  children,
}: {
  avoid: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  // Measured while expanded, so the collapsed panel still knows the size
  // it would return to; otherwise collapsing would end the overlap and
  // immediately re-expand it.
  const expandedHeight = React.useRef(0);
  const overlapping = React.useRef(false);

  React.useEffect(() => {
    const check = () => {
      const panel = panelRef.current;
      const other = avoid.current;
      if (!panel) return;
      if (!collapsed) expandedHeight.current = panel.offsetHeight;
      const bottom = panel.getBoundingClientRect().top + expandedHeight.current;
      const next = other ? other.getBoundingClientRect().top < bottom : false;
      // Only act on the change, so a manual toggle in between is respected.
      if (next !== overlapping.current) {
        overlapping.current = next;
        setCollapsed(next);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [avoid, collapsed]);

  return (
    <div
      ref={panelRef}
      className={`${styles.controls} ${collapsed ? styles.collapsed : ""}`}
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span>Controls</span>
        <span aria-hidden="true">{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && children}
    </div>
  );
}
