import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Trash2 } from "lucide-react";
import { useVisited } from "@/hooks/use-visited";
import { useShortlist } from "@/hooks/use-shortlist";
import { getProblemById } from "@/lib/sih-data";
import { ProblemCard } from "@/components/problem-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/visited")({
  head: () => ({
    meta: [
      { title: "Recently Visited Problem Statements — SIH 2026–27 | CSJMU" },
      {
        name: "description",
        content:
          "Pick up where you left off: every SIH 2026–27 problem statement you opened, in the order you read them.",
      },
      { property: "og:title", content: "Recently Visited SIH Problem Statements" },
      {
        property: "og:description",
        content: "Your reading history of SIH 2026–27 problem statements for the CSJMU hackathon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisitedPage,
});

const ago = (at: number) => {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
};

function VisitedPage() {
  const { entries, hydrated, clear, remove } = useVisited();
  const { has, toggle } = useShortlist();
  const items = entries
    .map((e) => ({ entry: e, ps: getProblemById(e.id) }))
    .filter((x): x is { entry: typeof x.entry; ps: NonNullable<typeof x.ps> } => !!x.ps);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] grid-bg" />
      <main className="relative mx-auto max-w-7xl px-4 pt-12 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
              <History className="h-3.5 w-3.5" /> Continue reading
            </p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Recently visited</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Every problem statement you opened, newest first — so you never lose your place.
            </p>
          </div>
          {items.length ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm transition hover:border-destructive/60 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear history
            </button>
          ) : null}
        </header>

        {!hydrated ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass h-56 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass mt-10 rounded-3xl p-12 text-center">
            <h2 className="text-xl font-bold">Nothing visited yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open a problem statement and it will show up here.
            </p>
            <Link
              to="/"
              hash="explorer"
              className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Browse problem statements
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 pb-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(({ ps, entry }) => (
              <div key={ps.id} className="relative">
                <ProblemCard ps={ps} saved={has(ps.id)} onToggle={toggle} />
                <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                  <span>Opened {ago(entry.at)}</span>
                  <button
                    type="button"
                    onClick={() => remove(ps.id)}
                    className="hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
