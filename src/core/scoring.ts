import type { Issue } from "../types/index";

export function calculateScore(issues: Issue[]): number {
  // O(n): track worst severity per rule in a single pass
  const ruleSeverityMap = new Map<string, "low" | "medium" | "high">();

  for (const issue of issues) {
    if (!issue.ruleId) continue;
    const current = ruleSeverityMap.get(issue.ruleId);
    if (
      !current ||
      issue.severity === "high" ||
      (issue.severity === "medium" && current === "low")
    ) {
      ruleSeverityMap.set(issue.ruleId, issue.severity);
    }
  }

  let score = 10;
  for (const severity of ruleSeverityMap.values()) {
    if (severity === "high") score -= 2;
    else if (severity === "medium") score -= 1;
    else score -= 0.5;
  }

  // light volume penalty: up to -2 extra for many occurrences
  score -= Math.min(issues.length * 0.2, 2);

  return Math.max(0, Math.round(score * 10) / 10);
}
