import { useCallback, useEffect, useState } from "react";

const KEY = "sih-shortlist-v1";
const EVENT = "sih-shortlist-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useShortlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const commit = useCallback((next: string[]) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      commit(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
    [commit],
  );

  const remove = useCallback((id: string) => commit(read().filter((x) => x !== id)), [commit]);
  const clear = useCallback(() => commit([]), [commit]);

  return { ids, hydrated, toggle, remove, clear, has: (id: string) => ids.includes(id) };
}
