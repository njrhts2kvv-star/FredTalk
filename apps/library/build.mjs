import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
const root = path.dirname(fileURLToPath(import.meta.url));
const localModules = path.join(root, "node_modules");
const modules = localModules;
if (!existsSync(path.join(modules, "esbuild")))
  throw new Error("Install the declared package dependencies before building.");
const require = createRequire(path.join(modules, "_resolver.cjs"));
const { build } = require("esbuild");
const standalone = true;
const outdir = standalone
  ? path.join(root, "dist")
  : path.resolve(root, "../web/design");
await fs.mkdir(outdir, { recursive: true });
await build({
  entryPoints: [path.join(root, "src/main.jsx")],
  outdir: path.join(outdir, "assets"),
  entryNames: "app",
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  jsx: "automatic",
  nodePaths: [modules],
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
  metafile: false,
});
await fs.writeFile(
  path.join(outdir, "index.html"),
  `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><title>FredTalk · 设计规范</title><link rel="stylesheet" href="./assets/app.css"></head><body><div id="root"></div><script type="module" src="./assets/app.js"></script></body></html>`,
);
console.log("Built FredTalk Design System:", outdir);
