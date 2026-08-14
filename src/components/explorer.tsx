import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  LayoutGrid,
  List,
  FileDown,
  RotateCcw,
  History,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  activeFilterCount,
  categories,
  departments,
  emptyFilters,
  filterProblems,
  organisations,
  themes,
  type Filters,
} from "@/lib/sih-data";
import { useShortlist } from "@/hooks/use-shortlist";
import { ProblemCard, ProblemListRow } from "@/components/problem-card";
import { useVisited } from "@/hooks/use-visited";
import { readExplorerState, writeExplorerState } from "@/lib/explorer-state";
import { exportProblemsToPdf } from "@/lib/export-pdf";
import { cn } from "@/lib/utils";

type Facet = { value: string; count: number };

function FacetGroup({
  title,
  options,
  selected,
  onToggle,
  limit = 8,
}: {
  title: string;
  options: Facet[];
  selected: string[];
  onToggle: (v: string) => void;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const filtered = q
      ? options.filter((o) => o.value.toLowerCase().includes(q.toLowerCase()))
      : options;
    return expanded || q ? filtered : filtered.slice(0, limit);
  }, [options, q, expanded, limit]);

  return (
    <section className="border-b border-border/60 py-4 last:border-0">
      <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h4>
      {options.length > limit ? (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          className="mt-3 w-full rounded-lg border border-input bg-background/60 px-3 py-1.5 text-xs outline-none focus-visible:border-primary/60"
        />
      ) : null}
      <ul className="mt-3 space-y-1.5">
        {list.map((o) => {
          const active = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-secondary/60",
                  active && "bg-primary/10 text-primary",
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggle(o.value)}
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-[oklch(0.72_0.16_232)]"
                />
                <span className="min-w-0 flex-1 leading-snug">{o.value}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > limit && !q ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all ${options.length}`}
        </button>
      ) : null}
    </section>
  );
}

const PAGE = 20;

export function Explorer({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const { toggle, has, hydrated } = useShortlist();
  const { last, entries } = useVisited();
  const [visible, setVisible] = useState(PAGE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [exporting, setExporting] = useState(false);
  const [restored, setRestored] = useState(false);

  const results = useMemo(() => filterProblems(filters), [filters]);
  const active = activeFilterCount(filters);

  // Restore how far the user had scrolled through the list and their view mode.
  useEffect(() => {
    const s = readExplorerState();
    setVisible(s.visible);
    setViewMode(s.viewMode);
    setRestored(true);
  }, []);

  // Keep the result order in storage so a PS page can offer next / previous.
  useEffect(() => {
    writeExplorerState({ order: results.map((p) => p.id) });
  }, [results]);

  useEffect(() => {
    if (!restored) return;
    writeExplorerState({ visible, viewMode });
  }, [visible, viewMode, restored]);

  useEffect(() => {
    if (!restored) return;
    setVisible(PAGE);
  }, [filters, restored]);
  useEffect(() => {
    if (!filters.query) return;
    setSearching(true);
    const t = setTimeout(() => setSearching(false), 180);
    return () => clearTimeout(t);
  }, [filters.query]);

  const toggleValue = (key: keyof Omit<Filters, "query">, value: string) => {
    const list = filters[key];
    setFilters({
      ...filters,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  };

  const panel = (
    <div className="px-1">
      <FacetGroup
        title="Category"
        options={categories}
        selected={filters.category}
        onToggle={(v) => toggleValue("category", v)}
      />
      <FacetGroup
        title="Theme / Technology"
        options={themes}
        selected={filters.theme}
        onToggle={(v) => toggleValue("theme", v)}
      />
      <FacetGroup
        title="Department"
        options={departments}
        selected={filters.department}
        onToggle={(v) => toggleValue("department", v)}
      />
      <FacetGroup
        title="Organisation / Ministry"
        options={organisations}
        selected={filters.organisation}
        onToggle={(v) => toggleValue("organisation", v)}
      />
    </div>
  );

  return (
    <div id="explorer" className="mx-auto max-w-7xl scroll-mt-24 px-4 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan uppercase">The explorer</p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Problem Statements For Internal Hackathon</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Search across every official problem statement, narrow it down by category, theme,
          department or organisation, and shortlist the ones your team can genuinely build.
        </p>
      </div>

      <div className="glass sticky top-[4.5rem] z-30 rounded-2xl p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              aria-label="Search problem statements"
              placeholder="🔍 Search problem statements, PS ID, department, category, keywords..."
              className="w-full rounded-xl border border-input bg-background/60 py-3 pr-9 pl-9 text-sm outline-none focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            {filters.query ? (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, query: "" })}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition hover:border-primary/50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {active ? (
              <span className="rounded-md bg-primary/20 px-1.5 text-xs text-primary">{active}</span>
            ) : null}
          </button>
        </div>
      </div>

      {last ? (
        <div className="glass mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <History className="h-3.5 w-3.5 shrink-0 text-cyan" />
            <span className="truncate">
              You were last reading{" "}
              <span className="font-mono text-primary">{last.id}</span>
              {entries.length > 1 ? ` · ${entries.length} visited` : ""}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/problem/$psId"
              params={{ psId: last.id }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
            >
              Resume <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/visited"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              All visited
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass hidden h-fit rounded-2xl p-5 lg:sticky lg:top-40 lg:block">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold">Filters</h3>
            {active ? (
              <button
                type="button"
                onClick={() => setFilters({ ...emptyFilters, query: filters.query })}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <div className="mt-2 max-h-[65vh] overflow-y-auto pr-1">{panel}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(visible, results.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{results.length}</span> Problem
                Statements
                {searching ? (
                  <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-primary" />
                ) : null}
              </p>

              <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-secondary/20 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={exporting || results.length === 0}
                onClick={async () => {
                  setExporting(true);
                  try {
                    await exportProblemsToPdf(results, filters);
                  } finally {
                    setExporting(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-3.5 py-2 text-xs font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5" />
                )}
                Export {results.length} as PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters(emptyFilters);
                  setVisible(PAGE);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset filters
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="glass mt-6 rounded-2xl p-12 text-center">
              <h3 className="text-xl font-bold">No Problem Statements Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or clear some filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={cn(
                "mt-6 gap-5",
                viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
              )}>
                {results.slice(0, visible).map((ps) =>
                  hydrated ? (
                    viewMode === "grid" ? (
                      <ProblemCard key={ps.id} ps={ps} saved={has(ps.id)} onToggle={toggle} />
                    ) : (
                      <ProblemListRow key={ps.id} ps={ps} saved={has(ps.id)} onToggle={toggle} />
                    )
                  ) : (
                    <div key={ps.id} className={cn("glass animate-pulse rounded-2xl", viewMode === "grid" ? "h-64" : "h-20")} />
                  ),
                )}
              </div>
              {visible < results.length ? (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE)}
                    className="rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
                  >
                    Load more problem statements
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="glass absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">Filters</h3>
              <div className="flex items-center gap-3">
                {active ? (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...emptyFilters, query: filters.query })}
                    className="text-xs text-primary"
                  >
                    Clear all
                  </button>
                ) : null}
                <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
