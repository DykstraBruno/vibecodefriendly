import type { Issue } from "../types/index";

export function calculateRisk(
  issues: Issue[],
  score: number
): "low" | "medium" | "high" {
  let highCount = 0;
  let mediumCount = 0;

  for (const issue of issues) {
    if (issue.severity === "high") highCount++;
    else if (issue.severity === "medium") mediumCount++;
  }

  const hasMedium = mediumCount > 0;
  const isLowScore = score < 5;

  if (highCount > 0) return "high";
  if (mediumCount >= 3) return "high";
  if (isLowScore && hasMedium) return "high"; // score-based escalation only when issues exist
  if (hasMedium) return "medium";
  return "low";
}
