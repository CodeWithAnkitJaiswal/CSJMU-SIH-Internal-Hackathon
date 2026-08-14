import { useCallback, useEffect, useState } from "react";

const KEY = "sih-visited-v1";
const EVENT = "sih-visited-change";
const LIMIT = 60;

export type VisitEntry = { id: string; at: number };

function read(): VisitEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(v)) return [];
    return v.filter(
      (x): x is VisitEntry =>
        !!x && typeof x.id === "string" && typeof x.at === "number",
    );
  } catch {
    return [];
  }
}

function commit(next: VisitEntry[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, LIMIT)));
  window.dispatchEvent(new Event(EVENT));
}

/** Records a visit without subscribing the caller to updates. */
export function recordVisit(id: string) {
  if (typeof window === "undefined") return;
  commit([{ id, at: Date.now() }, ...read().filter((v) => v.id !== id)]);
}

export function useVisited() {
  const [entries, setEntries] = useState<VisitEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(read());
    setHydrated(true);
    const sync = () => setEntries(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remove = useCallback((id: string) => commit(read().filter((v) => v.id !== id)), []);
  const clear = useCallback(() => commit([]), []);

  return { entries, hydrated, remove, clear, last: entries[0] ?? null };
}
