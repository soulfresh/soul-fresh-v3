"use client";

import React from "react";

/**
 * A value persisted as JSON through one of the experiment's dev-only route
 * handlers. Changes apply locally at once and are written after. A failed
 * write (the dev server being down, say) leaves the local state in place
 * and reports through `error`; `retry` writes the current state again.
 */
export function useJsonFile<T>(endpoint: string, initial: T) {
  const [value, setValue] = React.useState(initial);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Writes replace the whole file, so they must land in order: each one
  // waits for the previous to finish.
  const writes = React.useRef(Promise.resolve());

  React.useEffect(() => {
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error(`GET ${endpoint}: ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then((stored) => {
        setValue(stored);
        setLoaded(true);
      })
      .catch((e: unknown) => {
        console.error(e);
        setError(`Couldn't load ${endpoint}. Is the dev server running?`);
      });
  }, [endpoint]);

  const write = (next: T) => {
    const body = JSON.stringify(next);
    writes.current = writes.current
      .then(() =>
        fetch(endpoint, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body,
        }),
      )
      .then((response) => {
        if (!response.ok) throw new Error(`PUT ${endpoint}: ${response.status}`);
        setError(null);
      })
      .catch((e: unknown) => {
        console.error(e);
        setError(
          `Couldn't save ${endpoint}; your latest changes are not on disk. ` +
            "Is the dev server running?",
        );
      });
  };

  const set = (next: T) => {
    // Before the first load `next` is built from `initial`, and the PUT
    // would overwrite the file with it.
    if (!loaded) return;
    setValue(next);
    write(next);
  };

  const retry = () => {
    if (loaded) write(value);
  };

  return { value, loaded, error, set, retry };
}
