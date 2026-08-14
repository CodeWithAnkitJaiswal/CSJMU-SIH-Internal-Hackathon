import type { ProblemStatement } from "@/lib/sih-data";

export function buildPrompt(ps: ProblemStatement) {
  return [
    `I am participating in Smart India Hackathon (SIH) 2026-27. Help me understand and solve this problem statement.`,
    ``,
    `PS ID: ${ps.id}`,
    `Title: ${ps.title}`,
    ps.organisation ? `Organisation / Ministry: ${ps.organisation}` : "",
    ps.department ? `Department: ${ps.department}` : "",
    ps.category ? `Category: ${ps.category}` : "",
    ps.theme ? `Theme / Technology: ${ps.theme}` : "",
    ps.dataset ? `Dataset: ${ps.dataset}` : "",
    ``,
    `Description:`,
    ps.description || "(not provided)",
    ``,
    `Please give me: 1) a plain-English breakdown of the problem, 2) a practical solution architecture, 3) a recommended tech stack, 4) an MVP feature list I can prototype quickly, and 5) what judges will most likely look for.`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export const chatgptUrl = (ps: ProblemStatement) =>
  `https://chatgpt.com/?q=${encodeURIComponent(buildPrompt(ps))}`;

export const geminiUrl = (ps: ProblemStatement) =>
  `https://gemini.google.com/app?q=${encodeURIComponent(buildPrompt(ps))}`;
