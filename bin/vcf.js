#!/usr/bin/env node

// Entry point — delegates to the TypeScript source via ts-node.
// For production (after `npm run build`) swap to: require("../dist/index.js")
require("ts-node").register({ project: require("path").join(__dirname, "../tsconfig.json") });
require("../src/index.ts");
