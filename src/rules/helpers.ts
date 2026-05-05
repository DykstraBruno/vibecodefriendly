/**
 * Shared helpers for rule implementations.
 * Keeps rule code DRY and ensures consistent behaviour.
 */

/**
 * Returns the trimmed content of the line at `index` (0-based).
 * Returns an empty string if the index is out of bounds.
 */
export function getLineContent(lines: string[], index: number): string {
  return lines[index]?.trim() ?? "";
}

export function getLineNumberAtIndex(lines: string[], index: number): number {
  let cursor = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineEnd = cursor + lines[i].length;
    if (index <= lineEnd) return i + 1;
    cursor = lineEnd + 1;
  }

  return lines.length;
}

function isEscaped(code: string, index: number): boolean {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && code[i] === "\\"; i--) {
    slashCount++;
  }
  return slashCount % 2 === 1;
}

function canStartRegex(code: string, index: number): boolean {
  let i = index - 1;
  while (i >= 0 && /\s/.test(code[i])) i--;
  if (i < 0) return true;

  const ch = code[i];
  if ("([{=,:;!&|?+-*%^~<>".includes(ch)) return true;

  const before = code.slice(0, i + 1);
  return /\b(?:return|throw|case|delete|typeof|void|new|in|of|yield|await)$/.test(before);
}

/**
 * Removes JavaScript/TypeScript comments while preserving strings, template
 * literals, regex literals, and newline positions.
 */
export function stripComments(code: string): string {
  let result = "";
  let state:
    | "normal"
    | "single"
    | "double"
    | "template"
    | "regex"
    | "lineComment"
    | "blockComment" = "normal";
  let inRegexCharClass = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];

    if (state === "lineComment") {
      if (ch === "\n" || ch === "\r") {
        result += ch;
        state = "normal";
      }
      continue;
    }

    if (state === "blockComment") {
      if (ch === "\n" || ch === "\r") {
        result += ch;
      }
      if (ch === "*" && next === "/") {
        i++;
        state = "normal";
      }
      continue;
    }

    result += ch;

    if (state === "single") {
      if (ch === "'" && !isEscaped(code, i)) state = "normal";
      continue;
    }

    if (state === "double") {
      if (ch === '"' && !isEscaped(code, i)) state = "normal";
      continue;
    }

    if (state === "template") {
      if (ch === "`" && !isEscaped(code, i)) state = "normal";
      continue;
    }

    if (state === "regex") {
      if (ch === "[" && !isEscaped(code, i)) inRegexCharClass = true;
      else if (ch === "]" && !isEscaped(code, i)) inRegexCharClass = false;
      else if (ch === "/" && !isEscaped(code, i) && !inRegexCharClass) {
        state = "normal";
      }
      continue;
    }

    if (ch === "'") {
      state = "single";
    } else if (ch === '"') {
      state = "double";
    } else if (ch === "`") {
      state = "template";
    } else if (ch === "/" && next === "/") {
      result = result.slice(0, -1);
      i++;
      state = "lineComment";
    } else if (ch === "/" && next === "*") {
      result = result.slice(0, -1);
      i++;
      state = "blockComment";
    } else if (ch === "/" && canStartRegex(code, i)) {
      state = "regex";
      inRegexCharClass = false;
    }
  }

  return result;
}
