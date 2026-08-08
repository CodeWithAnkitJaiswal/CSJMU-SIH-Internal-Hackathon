import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Star, X } from "lucide-react";
import { useShortlist } from "@/hooks/use-shortlist";
import { REGISTER_URL } from "@/lib/links";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", to: "/", hash: "" },
  { label: "Problem Statements", to: "/", hash: "explorer" },
  { label: "Categories", to: "/", hash: "categories" },
  { label: "SIH Guide", to: "/", hash: "guide" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ids } = useShortlist();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled ? "glass border-b border-border/70" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 font-display text-sm font-bold text-primary">
            RC
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold tracking-tight">
              TEAM RAGNAROK CODERS
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              CSJMU Kanpur · SIH 2026–27
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              {...(l.hash ? { hash: l.hash } : {})}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/shortlist"
            className="ml-1 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/50"
          >
            <Star className="h-4 w-4 text-amber" /> My Shortlist
            <span className="rounded-md bg-secondary px-1.5 text-xs text-muted-foreground">
              {ids.length}
            </span>
          </Link>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Register
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-lg border border-border p-2 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="glass border-t border-border/70 px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/shortlist" className="rounded-lg px-3 py-2.5 text-sm text-foreground">
              ⭐ My Shortlist ({ids.length})
            </Link>
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Register
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
