import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { useShortlist } from "@/hooks/use-shortlist";
import { problemStatements } from "@/lib/sih-data";
import { ProblemCard } from "@/components/problem-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/shortlist")({
  head: () => ({
    meta: [
      { title: "My Shortlist — SIH 2026–27 Problem Statements | CSJMU" },
      {
        name: "description",
        content:
          "Review the SIH 2026–27 problem statements you saved for the CSJM University internal hackathon and pick the one your team will build.",
      },
      { property: "og:title", content: "My SIH Shortlist — CSJMU Internal Hackathon" },
      {
        property: "og:description",
        content: "Your saved SIH 2026–27 problem statements, ready to compare with your team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShortlistPage,
});

function ShortlistPage() {
  const { ids, hydrated, toggle, has, clear } = useShortlist();
  const saved = problemStatements.filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] grid-bg" />
      <main className="relative mx-auto max-w-7xl px-4 pt-12 lg:px-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
              Saved locally in your browser
            </p>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold sm:text-4xl">
              <Star className="h-7 w-7 shrink-0 text-amber" /> My Shortlist
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {hydrated ? `${saved.length} problem statement${saved.length === 1 ? "" : "s"} saved` : "Loading…"}
            </p>
          </div>
          {saved.length ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-destructive/60 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear shortlist
            </button>
          ) : null}
        </header>

        {!hydrated ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass h-64 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="glass mt-10 rounded-2xl p-14 text-center">
            <h2 className="text-xl font-bold">Nothing shortlisted yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse the explorer and tap the bookmark icon on any problem statement to save it here.
            </p>
            <Link
              to="/"
              hash="explorer"
              className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Explore Problem Statements
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((ps) => (
              <ProblemCard key={ps.id} ps={ps} saved={has(ps.id)} onToggle={toggle} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
