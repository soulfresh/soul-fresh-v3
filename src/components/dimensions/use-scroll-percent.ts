import React from "react";

/**
 * How far the page is scrolled, from 0 (top) to 1 (bottom). Updates at
 * most once per animation frame. Returns 0 until mounted.
 */
export function useScrollPercent(): number {
  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        setPercent(
          scrollable > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollable))
            : 0,
        );
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return percent;
}
