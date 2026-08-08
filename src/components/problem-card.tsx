import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ArrowRight, Building2, Layers } from "lucide-react";
import { difficultyOf, type ProblemStatement } from "@/lib/sih-data";
import { cn } from "@/lib/utils";

const diffTone: Record<string, string> = {
  "Beginner friendly": "text-cyan border-cyan/30 bg-cyan/10",
  Intermediate: "text-primary border-primary/30 bg-primary/10",
  Advanced: "text-violet border-violet/30 bg-violet/10",
};

export function ProblemCard({
  ps,
  saved,
  onToggle,
}: {
  ps: ProblemStatement;
  saved: boolean;
  onToggle: (id: string) => void;
}) {
  const difficulty = difficultyOf(ps);

  return (
    <article className="glass glass-hover flex h-full flex-col gap-4 rounded-2xl p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
              {ps.id}
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs",
                ps.category === "Hardware"
                  ? "border-amber/30 bg-amber/10 text-amber"
                  : "border-violet/30 bg-violet/10 text-violet",
              )}
            >
              {ps.category}
            </span>
            <span className={cn("rounded-md border px-2 py-0.5 text-xs", diffTone[difficulty])}>
              {difficulty}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">{ps.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onToggle(ps.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${ps.id} from shortlist` : `Add ${ps.id} to shortlist`}
          className="shrink-0 rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </header>

      {ps.description ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {ps.description}
        </p>
      ) : null}

      <div className="mt-auto space-y-2 text-xs text-muted-foreground">
        {ps.theme ? (
          <p className="flex items-start gap-2">
            <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" />
            <span className="min-w-0">{ps.theme}</span>
          </p>
        ) : null}
        {ps.organisation ? (
          <p className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" />
            <span className="min-w-0">{ps.organisation}</span>
          </p>
        ) : null}
      </div>

      <Link
        to="/problem/$psId"
        params={{ psId: ps.id }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
      >
        View Details <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function ProblemListRow({
  ps,
  saved,
  onToggle,
}: {
  ps: ProblemStatement;
  saved: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <article className="glass glass-hover flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            {ps.id}
          </span>
          <span className={cn(
            "rounded px-1.5 py-0.5 text-[10px] border",
            ps.category === "Hardware" ? "border-amber/30 bg-amber/10 text-amber" : "border-violet/30 bg-violet/10 text-violet"
          )}>
            {ps.category}
          </span>
          <span className="text-xs text-muted-foreground">• {ps.organisation}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground truncate sm:text-base">
          {ps.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{ps.theme}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/problem/$psId"
          params={{ psId: ps.id }}
          className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          Details
        </Link>
        <button
          type="button"
          onClick={() => onToggle(ps.id)}
          aria-pressed={saved}
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

