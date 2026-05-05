import { stripComments } from "../rules/helpers";

export type ParsedCode = {
  rawText: string;
  rawLines: string[];
  text: string;
  lines: string[];
};

export function parseCode(code: string): ParsedCode {
  const text = stripComments(code);
  return {
    rawText: code,
    rawLines: code.split("\n"),
    text,
    lines: text.split("\n"),
  };
}
