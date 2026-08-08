import raw from "@/data/problem-statements.json";

export type ProblemStatement = {
  id: string;
  title: string;
  category: string;
  theme: string;
  description: string;
  department: string;
  organisation: string;
  dataset: string;
};

export const problemStatements: ProblemStatement[] = raw as ProblemStatement[];

export const getProblemById = (id: string) =>
  problemStatements.find((p) => p.id.toLowerCase() === id.toLowerCase());

function tally(key: keyof ProblemStatement) {
  const map = new Map<string, number>();
  for (const p of problemStatements) {
    const v = (p[key] || "").trim();
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export const categories = tally("category");
export const themes = tally("theme");
export const departments = tally("department");
export const organisations = tally("organisation");

export const stats = {
  total: problemStatements.length,
  categories: categories.length,
  themes: themes.length,
  departments: departments.length,
  organisations: organisations.length,
};

/** Rough, transparent complexity hint derived only from the supplied text. */
export function difficultyOf(p: ProblemStatement): "Beginner friendly" | "Intermediate" | "Advanced" {
  const len = p.description.length;
  if (len < 450) return "Beginner friendly";
  if (len < 1100) return "Intermediate";
  return "Advanced";
}

const haystack = new Map<string, string>(
  problemStatements.map((p) => [
    p.id,
    [p.id, p.title, p.category, p.theme, p.department, p.organisation, p.description]
      .join(" ")
      .toLowerCase(),
  ]),
);

export type Filters = {
  query: string;
  category: string[];
  theme: string[];
  department: string[];
  organisation: string[];
};

export const emptyFilters: Filters = {
  query: "",
  category: [],
  theme: [],
  department: [],
  organisation: [],
};

export function filterProblems(f: Filters): ProblemStatement[] {
  const terms = f.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return problemStatements.filter((p) => {
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.theme.length && !f.theme.includes(p.theme)) return false;
    if (f.department.length && !f.department.includes(p.department)) return false;
    if (f.organisation.length && !f.organisation.includes(p.organisation)) return false;
    if (!terms.length) return true;
    const hay = haystack.get(p.id) ?? "";
    return terms.every((t) => hay.includes(t));
  });
}

export const activeFilterCount = (f: Filters) =>
  f.category.length + f.theme.length + f.department.length + f.organisation.length;
