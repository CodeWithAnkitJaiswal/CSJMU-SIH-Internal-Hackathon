import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Flame,
  Layers,
  PlayCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Explorer } from "@/components/explorer";
import { CountUp, Reveal } from "@/components/motion";
import { REGISTER_URL, SIH_VIDEO_URL } from "@/lib/links";
import { readExplorerState, writeExplorerState, EXPLORER_EVENT } from "@/lib/explorer-state";
import {
  categories,
  departments,
  emptyFilters,
  organisations,
  stats,
  themes,
  type Filters,
} from "@/lib/sih-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIH 2026–27 Problem Statement Explorer — CSJMU Internal Hackathon" },
      {
        name: "description",
        content:
          "Search, filter and shortlist all Smart India Hackathon 2026–27 problem statements for the CSJM University Kanpur internal hackathon. Built by Team Ragnarok Coders.",
      },
      {
        property: "og:title",
        content: "SIH 2026–27 Problem Statement Explorer — CSJMU Internal Hackathon",
      },
      {
        property: "og:description",
        content:
          "Explore, understand, search and shortlist official SIH problem statements for the CSJM University internal hackathon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const flow = ["Problem", "Idea", "Team", "Prototype", "Presentation", "Innovation"];

const psFields = [
  ["PS ID", "Unique identification number"],
  ["Problem Statement", "The actual challenge"],
  ["Organization / Ministry", "The organization presenting the challenge"],
  ["Category", "Broad domain of the problem — Software or Hardware"],
  ["Department / Theme", "Specific area related to the problem"],
  ["Technology / Suggested Solution", "Technologies or approaches that may be relevant"],
];

const steps = [
  ["01", "Understand", "Read the problem carefully."],
  ["02", "Explore", "Look at related technologies, domains and organizations."],
  ["03", "Discuss", "Discuss suitable problems with your teammates."],
  ["04", "Shortlist", "Save the problem statements that match your team's skills and interests."],
  ["05", "Build", "Choose your strongest problem and start developing your solution."],
];

function Index() {
  const [filters, setFiltersState] = useState<Filters>(emptyFilters);
  const [restored, setRestored] = useState(false);

  // Restore the last session's filters (and scroll position) on return.
  useEffect(() => {
    const state = readExplorerState();
    setFiltersState(state.filters);
    setRestored(true);
    if (state.scrollY > 0) {
      requestAnimationFrame(() => window.scrollTo({ top: state.scrollY }));
    }
    const sync = () =>
      setFiltersState((prev) => {
        const next = readExplorerState().filters;
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    window.addEventListener(EXPLORER_EVENT, sync);
    return () => window.removeEventListener(EXPLORER_EVENT, sync);
  }, []);

  // Remember scroll position so returning from a PS lands in the same place.
  useEffect(() => {
    if (!restored) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        writeExplorerState({ scrollY: window.scrollY });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [restored]);

  const setFilters = (next: Filters) => {
    setFiltersState(next);
    writeExplorerState({ filters: next });
  };

  const jump = (next: Filters) => {
    setFilters(next);
    document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px] float-orb" />
        <div
          className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full bg-violet/20 blur-[120px] float-orb"
          style={{ animationDelay: "3s" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 text-center lg:px-8 lg:pt-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> CSJM University Internal Hackathon
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-7 max-w-4xl text-4xl leading-[1.05] font-extrabold sm:text-6xl lg:text-7xl">
              Smart India Hackathon <span className="text-gradient">2026–27</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 font-display text-sm font-bold tracking-[0.32em] text-cyan sm:text-base">
              TEAM RAGNAROK CODERS
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore, understand, search, and shortlist the official Smart India Hackathon problem
              statements for the CSJM University Internal Hackathon — all in one place.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => jump(emptyFilters)}
                className="glow-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
              >
                Explore Problem Statements <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-surface/60 px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary/70 sm:w-auto"
              >
                Register for Internal Hackathon
              </a>
            </div>
          </Reveal>

          {/* STATS */}
          <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["Problem Statements", stats.total],
              ["Categories", stats.categories],
              ["Themes / Domains", stats.themes],
              ["Departments", stats.departments],
              ["Organizations", stats.organisations],
            ].map(([label, value], i) => (
              <Reveal key={label as string} delay={i * 70}>
                <div className="glass glass-hover rounded-2xl p-5">
                  <p className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">
                    <CountUp to={value as number} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{label as string}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS SIH */}
      <section id="guide" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <div className="glass h-full rounded-3xl p-7 sm:p-9">
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
                New to SIH?
              </p>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                What is Smart India Hackathon?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Smart India Hackathon (SIH) is one of India's largest innovation and problem-solving
                initiatives, where students work in teams to develop technology-based solutions to
                real-world problems presented by government organizations, industries, and other
                institutions.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {[
                  "Choose a real-world Problem Statement",
                  "Form a team",
                  "Understand the problem deeply",
                  "Design an innovative solution",
                  "Build a prototype or working solution",
                  "Present your idea to judges",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 rounded-xl bg-secondary/40 px-3 py-2.5 text-sm text-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    <span className="min-w-0">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                {flow.map((f, i) => (
                  <span key={f} className="flex items-center gap-2">
                    <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                      {f}
                    </span>
                    {i < flow.length - 1 ? (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                  </span>
                ))}
              </div>

              <a
                href={SIH_VIDEO_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <PlayCircle className="h-4 w-4" /> Watch a detailed explainer video
              </a>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="glass h-full rounded-3xl p-7 sm:p-9">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
                <BookOpen className="h-3.5 w-3.5" /> Basics
              </p>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                What is a Problem Statement?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                A Problem Statement (PS) describes a specific real-world challenge that participants
                are expected to understand and solve through technology, innovation, or a practical
                solution.
              </p>
              <dl className="mt-6 space-y-3">
                {psFields.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                    <dt className="text-sm font-semibold text-foreground">{k}</dt>
                    <dd className="mt-0.5 text-xs text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* QUICK DISCOVERY */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 lg:px-8">
        <Reveal>
          <div className="glass rounded-3xl p-7">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <Flame className="h-5 w-5 text-amber" /> Trending Domains
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The most represented technology buckets in this year's dataset — tap one to filter
              instantly.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {themes.slice(0, 12).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => jump({ ...emptyFilters, theme: [t.value] })}
                  className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-medium transition hover:border-primary/60 hover:text-primary"
                >
                  {t.value} <span className="text-muted-foreground">· {t.count}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {[
            { icon: Tag, title: "Explore by Category", items: categories.slice(0, 6), key: "category" as const },
            { icon: Compass, title: "Explore by Department", items: departments.slice(0, 6), key: "department" as const },
            { icon: Building2, title: "Explore by Organization", items: organisations.slice(0, 6), key: "organisation" as const },
          ].map((group, i) => (
            <Reveal key={group.title} delay={i * 90}>
              <div className="glass glass-hover h-full rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-base font-bold">
                  <group.icon className="h-4 w-4 text-cyan" /> {group.title}
                </h3>
                <ul className="mt-4 space-y-1.5">
                  {group.items.map((it) => (
                    <li key={it.value}>
                      <button
                        type="button"
                        onClick={() => jump({ ...emptyFilters, [group.key]: [it.value] })}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
                      >
                        <span className="truncate">{it.value}</span>
                        <span className="shrink-0 text-xs">{it.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EXPLORER */}
      <section className="py-8">
        <Explorer filters={filters} setFilters={setFilters} />
      </section>

      {/* BEGINNER GUIDE */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-4xl">First Time at SIH?</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Five simple steps from opening this page to starting your build.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([n, title, body], i) => (
            <Reveal key={n} delay={i * 80}>
              <div className="glass glass-hover h-full rounded-2xl p-5">
                <span className="font-display text-2xl font-extrabold text-gradient">{n}</span>
                <h3 className="mt-2 text-base font-bold">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-6 rounded-2xl border border-amber/25 bg-amber/10 p-5 text-sm leading-7 text-foreground">
            <Layers className="mr-2 inline h-4 w-4 text-amber" />
            Don't choose a problem just because it sounds complicated. Choose a problem your team
            understands, can realistically solve, and can demonstrate effectively.
          </p>
        </Reveal>
      </section>

      {/* REGISTRATION CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 lg:px-8">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-violet/25 blur-[110px]" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Participate?</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Register for the CSJM University Internal Hackathon
              </p>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className="glow-ring mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Register Now <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-6 text-xs text-muted-foreground sm:text-sm">
                Find your problem. Build your solution. Represent CSJM University at Smart India
                Hackathon.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
