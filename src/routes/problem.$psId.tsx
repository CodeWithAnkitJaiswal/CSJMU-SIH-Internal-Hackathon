import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Layers,
  Star,
  Tag,
  Landmark,
  Lightbulb,
  Sparkles,
  Bot,
  FileDown,
} from "lucide-react";
import { difficultyOf, getProblemById, problemStatements } from "@/lib/sih-data";
import { useShortlist } from "@/hooks/use-shortlist";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { recordVisit } from "@/hooks/use-visited";
import { readExplorerState } from "@/lib/explorer-state";
import { chatgptUrl, geminiUrl } from "@/lib/ai-prompt";
import { exportProblemsToPdf } from "@/lib/export-pdf";
import { emptyFilters } from "@/lib/sih-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/problem/$psId")({
  loader: ({ params }) => {
    const ps = getProblemById(params.psId);
    if (!ps) throw notFound();
    return { ps };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Problem statement unavailable — SIH 2026–27 Explorer" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { ps } = loaderData;
    const title = `${ps.id} — ${ps.title.slice(0, 70)} | SIH 2026–27 Explorer`;
    const description = (ps.description || ps.title).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProblemDetail,
  errorComponent: ({ error }) => (
    <div className="p-16 text-center" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <h1 className="text-2xl font-bold">Problem statement not found</h1>
      <Link to="/" hash="explorer" className="mt-4 inline-block text-primary hover:underline">
        Back to Problem Statements
      </Link>
    </div>
  ),
});

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="glass rounded-xl p-4">
      <p className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
        <Icon className="h-3.5 w-3.5 text-cyan" /> {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ProblemDetail() {
  const { ps } = Route.useLoaderData();
  const { has, toggle, hydrated } = useShortlist();
  const saved = hydrated && has(ps.id);

  // Track the visit so the explorer can offer "resume".
  useEffect(() => {
    recordVisit(ps.id);
  }, [ps.id]);

  // Walk the exact list the user was browsing (filters included).
  const siblings = useMemo(() => {
    const order = readExplorerState().order;
    const list = order.length ? order : problemStatements.map((p) => p.id);
    const i = list.indexOf(ps.id);
    if (i === -1) return { prev: null, next: null, index: -1, total: list.length };
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i < list.length - 1 ? list[i + 1] : null,
      index: i,
      total: list.length,
    };
  }, [ps.id]);

  const pager = (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      {siblings.prev ? (
        <Link
          to="/problem/$psId"
          params={{ psId: siblings.prev }}
          className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 text-primary" /> Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm text-muted-foreground/60">
          <ArrowLeft className="h-4 w-4" /> Previous
        </span>
      )}
      {siblings.index >= 0 ? (
        <span className="text-xs text-muted-foreground">
          {siblings.index + 1} of {siblings.total} in your current list
        </span>
      ) : null}
      {siblings.next ? (
        <Link
          to="/problem/$psId"
          params={{ psId: siblings.next }}
          className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          Next <ArrowRight className="h-4 w-4 text-primary" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm text-muted-foreground/60">
          Next <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
  const related = problemStatements
    .filter((p) => p.id !== ps.id && (p.theme === ps.theme || p.organisation === ps.organisation))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-bg" />
      <main className="relative mx-auto max-w-5xl px-4 pt-10 pb-6 lg:px-8">
        <Link
          to="/"
          hash="explorer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Problem Statements
        </Link>

        <div className="mt-5">{pager}</div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary">
            {ps.id}
          </span>
          <span
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs",
              ps.category === "Hardware"
                ? "border-amber/30 bg-amber/10 text-amber"
                : "border-violet/30 bg-violet/10 text-violet",
            )}
          >
            {ps.category}
          </span>
          <span className="rounded-md border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-xs text-cyan">
            {difficultyOf(ps)}
          </span>
        </div>

        <h1 className="mt-4 text-2xl leading-tight font-extrabold sm:text-4xl">{ps.title}</h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toggle(ps.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition",
              saved
                ? "border-amber/40 bg-amber/15 text-amber"
                : "border-border hover:border-primary/50",
            )}
          >
            <Star className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Shortlisted" : "Add to Shortlist"}
          </button>
          <a
            href={chatgptUrl(ps)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-5 py-2.5 text-sm font-semibold text-cyan transition hover:bg-cyan/20"
          >
            <Bot className="h-4 w-4" /> Open in ChatGPT
          </a>
          <a
            href={geminiUrl(ps)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-violet/40 bg-violet/10 px-5 py-2.5 text-sm font-semibold text-violet transition hover:bg-violet/20"
          >
            <Sparkles className="h-4 w-4" /> Open in Gemini
          </a>
          <button
            type="button"
            onClick={() =>
              exportProblemsToPdf([ps], emptyFilters, {
                heading: `${ps.id} — Problem Statement`,
                fileName: `${ps.id}.pdf`,
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary/50"
          >
            <FileDown className="h-4 w-4" /> Export PDF
          </button>
          <Link
            to="/shortlist"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/50"
          >
            View my shortlist
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Meta icon={Landmark} label="Organisation / Ministry" value={ps.organisation} />
          <Meta icon={Building2} label="Department" value={ps.department} />
          <Meta icon={Layers} label="Theme / Technology" value={ps.theme} />
          <Meta icon={Tag} label="Category" value={ps.category} />
        </div>

        {ps.description ? (
          <section className="glass mt-8 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Problem Overview</h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line text-muted-foreground">
              {ps.description}
            </p>
          </section>
        ) : null}

        {ps.theme ? (
          <section className="glass mt-6 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Relevant Technologies</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This problem sits in the{" "}
              <span className="font-medium text-foreground">{ps.theme}</span> technology bucket, and
              is a <span className="font-medium text-foreground">{ps.category}</span> problem
              statement — plan your stack and prototype accordingly.
            </p>
          </section>
        ) : null}

        {ps.organisation ? (
          <section className="glass mt-6 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Organisation Details</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Presented by <span className="font-medium text-foreground">{ps.organisation}</span>
              {ps.department ? (
                <>
                  , through the{" "}
                  <span className="font-medium text-foreground">{ps.department}</span>
                </>
              ) : null}
              . Study how this organisation works today — judges reward solutions that fit real
              workflows.
            </p>
          </section>
        ) : null}

        {ps.dataset ? (
          <section className="glass mt-6 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Dataset</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{ps.dataset}</p>
          </section>
        ) : null}

        <section className="glass mt-6 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lightbulb className="h-4 w-4 text-amber" /> Why This Problem Matters
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Solving this helps {ps.organisation || "the presenting organisation"} serve people
            better in the {ps.theme || "given"} domain. A working, demonstrable prototype that
            addresses the core pain point above matters far more than a long feature list.
          </p>
        </section>

        {related.length ? (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Related problem statements</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/problem/$psId"
                  params={{ psId: r.id }}
                  className="glass glass-hover rounded-2xl p-4"
                >
                  <span className="font-mono text-xs text-primary">{r.id}</span>
                  <p className="mt-2 line-clamp-3 text-sm font-medium">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <div className="mt-10 mb-4">{pager}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
