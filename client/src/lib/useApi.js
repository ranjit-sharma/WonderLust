import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";

// Loads a GET endpoint; reload() refetches. A null path skips loading.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });

  const load = useCallback(() => {
    if (!path) return () => {};
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
  }, [path]);

  useEffect(load, [load]);

  return { ...state, setData: (data) => setState((s) => ({ ...s, data })), reload: load };
}
