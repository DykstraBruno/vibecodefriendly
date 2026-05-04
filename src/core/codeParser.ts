export type ParsedCode = {
  text: string;
  lines: string[];
};

export function parseCode(code: string): ParsedCode {
  return {
    text: code,
    lines: code.split("\n"),
  };
}
