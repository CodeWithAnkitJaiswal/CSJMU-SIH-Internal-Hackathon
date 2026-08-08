import { stats } from "@/lib/sih-data";

const team = ["Ankit — Leader", "Akshay", "Anubhav", "Siddharth", "Shivani", "Shivakshi"];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border/70 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-gradient">
              TEAM RAGNAROK CODERS
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              CSJM University Internal Hackathon — SIH 2026–27
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Built with curiosity, collaboration and innovation to help every SIH participant find
              the right problem.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">Team</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {team.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Dataset
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{stats.total} problem statements</li>
              <li>{stats.themes} themes / domains</li>
              <li>{stats.organisations} organisations</li>
              <li>{stats.departments} departments</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team Ragnarok Coders · Chhatrapati Shahu Ji Maharaj
          University, Kanpur. An internal hackathon resource for SIH participants.
        </p>
      </div>
    </footer>
  );
}
