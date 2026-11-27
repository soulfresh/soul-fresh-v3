"use client";

import React from "react";

/**
 * A value persisted as JSON through one of the experiment's dev-only route
 * handlers. Changes apply locally at once and are written after; a failed
 * write is logged and the local state stands.
 */
export function useJsonFile<T>(endpoint: string, initial: T) {
  const [value, setValue] = React.useState(initial);
  const [loaded, setLoaded] = React.useState(false);

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
      .catch(console.error);
  }, [endpoint]);

  const set = (next: T) => {
    // Before the first load `next` is built from `initial`, and the PUT
    // would overwrite the file with it.
    if (!loaded) return;
    setValue(next);
    fetch(endpoint, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`PUT ${endpoint}: ${response.status}`);
      })
      .catch(console.error);
  };

  return { value, loaded, set };
}
