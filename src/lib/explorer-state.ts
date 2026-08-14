import { emptyFilters, type Filters } from "@/lib/sih-data";

const KEY = "sih-explorer-state-v1";
export const EXPLORER_EVENT = "sih-explorer-state-change";

export type ExplorerState = {
  filters: Filters;
  visible: number;
  viewMode: "grid" | "list";
  scrollY: number;
  /** ids of the last computed result list — powers prev/next on a PS page */
  order: string[];
};

export const defaultExplorerState: ExplorerState = {
  filters: emptyFilters,
  visible: 20,
  viewMode: "grid",
  scrollY: 0,
  order: [],
};

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export function readExplorerState(): ExplorerState {
  if (typeof window === "undefined") return defaultExplorerState;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!raw || typeof raw !== "object") return defaultExplorerState;
    const f = raw.filters ?? {};
    return {
      filters: {
        query: typeof f.query === "string" ? f.query : "",
        category: asStringArray(f.category),
        theme: asStringArray(f.theme),
        department: asStringArray(f.department),
        organisation: asStringArray(f.organisation),
      },
      visible: typeof raw.visible === "number" && raw.visible > 0 ? raw.visible : 20,
      viewMode: raw.viewMode === "list" ? "list" : "grid",
      scrollY: typeof raw.scrollY === "number" ? raw.scrollY : 0,
      order: asStringArray(raw.order),
    };
  } catch {
    return defaultExplorerState;
  }
}

/**
 * Persists a patch. `notify` is opt-in: only cross-component writes (e.g. the
 * nav search box) should broadcast, otherwise listeners would loop.
 */
export function writeExplorerState(patch: Partial<ExplorerState>, notify = false) {
  if (typeof window === "undefined") return;
  const next = { ...readExplorerState(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  if (notify) window.dispatchEvent(new Event(EXPLORER_EVENT));
}

export function clearExplorerFilters() {
  writeExplorerState({ filters: emptyFilters, visible: 20, scrollY: 0 });
}
