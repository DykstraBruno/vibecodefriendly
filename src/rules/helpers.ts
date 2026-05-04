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
