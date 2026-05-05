import { describe, expect, it } from "vitest";
import { stripComments } from "../../src/rules/helpers";

describe("stripComments", () => {
  it("removes line comments", () => {
    const code = "const x = 1; // debugger\nconst y = 2;";

    expect(stripComments(code)).toBe("const x = 1; \nconst y = 2;");
  });

  it("removes block comments", () => {
    const code = "const x = 1; /* var y = 2; */\n/*\nconsole.log(x);\n*/\nconst z = 3;";

    expect(stripComments(code)).toBe("const x = 1; \n\n\n\nconst z = 3;");
  });

  it("preserves line-comment markers inside double-quoted strings", () => {
    const code = 'const url = "http://example.test/path"; // remove me';

    expect(stripComments(code)).toBe('const url = "http://example.test/path"; ');
  });

  it("preserves block-comment markers inside single-quoted strings", () => {
    const code = "const text = '/* still a string */'; /* remove me */";

    expect(stripComments(code)).toBe("const text = '/* still a string */'; ");
  });

  it("preserves comment-like text in template literals", () => {
    const code = "const msg = `hello // world /* still text */`; // remove me";

    expect(stripComments(code)).toBe("const msg = `hello // world /* still text */`; ");
  });

  it("preserves regex literals containing slashes", () => {
    const code = "const re = /\\/\\/foo/; // remove me";

    expect(stripComments(code)).toBe("const re = /\\/\\/foo/; ");
  });
});
