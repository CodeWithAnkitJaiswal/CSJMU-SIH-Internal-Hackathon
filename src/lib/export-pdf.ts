import type { ProblemStatement } from "@/lib/sih-data";
import type { Filters } from "@/lib/sih-data";

function filterSummary(f: Filters) {
  const parts: string[] = [];
  if (f.query) parts.push(`Search: "${f.query}"`);
  if (f.category.length) parts.push(`Category: ${f.category.join(", ")}`);
  if (f.theme.length) parts.push(`Theme: ${f.theme.join(", ")}`);
  if (f.department.length) parts.push(`Department: ${f.department.join(", ")}`);
  if (f.organisation.length) parts.push(`Organisation: ${f.organisation.join(", ")}`);
  return parts.length ? parts.join("  |  ") : "No filters applied — all problem statements";
}

/** Exports the given problem statements to a multi-page PDF. */
export async function exportProblemsToPdf(
  list: ProblemStatement[],
  filters: Filters,
  opts: { heading?: string; fileName?: string } = {},
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 44;
  const maxW = pageW - M * 2;
  let y = M;

  const ensure = (needed: number) => {
    if (y + needed <= pageH - M) return;
    doc.addPage();
    y = M;
  };

  const write = (
    text: string,
    size: number,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [30, 30, 30],
    gap = 6,
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    const lh = size * 1.35;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M, y);
      y += lh;
    }
    y += gap;
  };

  // Header
  write(opts.heading ?? "SIH 2026-27 Problem Statements", 20, "bold", [17, 24, 39], 4);
  write("CSJM University Kanpur - Internal Hackathon | Team Ragnarok Coders", 10, "normal", [
    100, 116, 139,
  ]);
  write(filterSummary(filters), 9, "normal", [100, 116, 139], 4);
  write(
    `${list.length} problem statement${list.length === 1 ? "" : "s"} - exported ${new Date().toLocaleString()}`,
    9,
    "normal",
    [100, 116, 139],
    10,
  );
  doc.setDrawColor(203, 213, 225);
  ensure(14);
  doc.line(M, y, pageW - M, y);
  y += 18;

  list.forEach((ps, i) => {
    ensure(70);
    write(`${i + 1}. [${ps.id}] ${ps.title}`, 12, "bold", [15, 23, 42], 4);
    const meta = [
      ps.organisation && `Organisation: ${ps.organisation}`,
      ps.department && `Department: ${ps.department}`,
      ps.category && `Category: ${ps.category}`,
      ps.theme && `Theme: ${ps.theme}`,
    ]
      .filter(Boolean)
      .join("   |   ");
    if (meta) write(meta, 8.5, "normal", [71, 85, 105], 4);
    if (ps.description) write(ps.description, 9.5, "normal", [51, 65, 85], 4);
    if (ps.dataset) write(`Dataset: ${ps.dataset}`, 9, "normal", [71, 85, 105], 4);
    ensure(14);
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y, pageW - M, y);
    y += 16;
  });

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${total}`, pageW - M, pageH - 20, { align: "right" });
  }

  doc.save(opts.fileName ?? `sih-problem-statements-${list.length}.pdf`);
}
