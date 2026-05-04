export type Issue = {
  type: "bug" | "smell" | "security";
  severity: "low" | "medium" | "high";
  message: string;
  line?: number;
};

export type ReviewResult = {
  file?: string;
  issues: Issue[];
};
