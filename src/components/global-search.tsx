import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { filterProblems, emptyFilters } from "@/lib/sih-data";
import { readExplorerState, writeExplorerState } from "@/lib/explorer-state";
import { cn } from "@/lib/utils";

/**
 * Site-wide problem statement search. Shows instant suggestions and pushes the
 * query into the persisted explorer state so the explorer opens pre-filtered.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    if (q.trim().length < 2) return [];
    return filterProblems({ ...emptyFilters, query: q }).slice(0, 6);
  }, [q]);

  const submit = () => {
    const state = readExplorerState();
    writeExplorerState(
      { filters: { ...state.filters, query: q }, visible: 20, scrollY: 0 },
      true,
    );
    setOpen(false);
    navigate({ to: "/", hash: "explorer" });
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        aria-label="Search problem statements"
        placeholder="Search problem statements…"
        className="w-full rounded-xl border border-input bg-background/60 py-2 pr-8 pl-9 text-sm outline-none transition focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      {q ? (
        <button
          type="button"
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {open && q.trim().length >= 2 ? (
        <div className="glass absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl p-2 shadow-xl">
          {suggestions.length ? (
            <>
              {suggestions.map((ps) => (
                <button
                  key={ps.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/problem/$psId", params: { psId: ps.id } });
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left transition hover:bg-secondary/60"
                >
                  <span className="font-mono text-[11px] text-primary">{ps.id}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-foreground">
                    {ps.title}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={submit}
                className="mt-1 block w-full rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
              >
                See all results in explorer
              </button>
            </>
          ) : (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              No problem statements match “{q}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
