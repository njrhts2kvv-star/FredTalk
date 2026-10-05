import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire, Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = [
  path.join(packageRoot, "node_modules"),
  path.resolve(packageRoot, "../../../skills/_runtime/remotion/preferred-motion-v2/node_modules"),
].find((directory) => existsSync(path.join(directory, "esbuild")));
assert.ok(modules, "The declared local library dependencies must be available.");
const require = createRequire(path.join(modules, "_metadata-test.cjs"));
const { build } = require("esbuild");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const result = await build({
  entryPoints: [path.join(packageRoot, "src/ReferenceLibrary.jsx")],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  packages: "external",
  nodePaths: [modules],
  logLevel: "silent",
});
const bundledFilename = path.join(packageRoot, "reference-library-test.cjs");
const bundled = new Module(bundledFilename);
bundled.filename = bundledFilename;
bundled.paths = [modules];
bundled._compile(result.outputFiles[0].text, bundled.filename);
const { ReferenceCard, ReferenceDialog } = bundled.exports;
const base = {
  id: "component:ep102-selected-01",
  label: "102-01",
  title: "文字与卡片入场",
  kind: "components",
  origin: "第102期",
  previews: [],
  reviewKind: "registered",
};
const card = (metadata = {}) => renderToStaticMarkup(
  React.createElement(ReferenceCard, { item: { ...base, ...metadata }, onSelect() {} }),
);

test("an explicitly new card displays NEW and its addition date", () => {
  const html = card({ isNew: true, addedAt: "2026-10-05T11:47:11+08:00" });
  assert.match(html, /class="reference-new-badge">NEW<\/span>/);
  assert.match(html, /dateTime="2026-10-05T11:47:11\+08:00"/);
  assert.match(html, /新增 2026-10-05<\/time>/);
  assert.match(html, /title="新增于 2026-10-05 11:47:11（北京时间）"/);
});

test("the detail header includes the same metadata", () => {
  const html = renderToStaticMarkup(React.createElement(ReferenceDialog, {
    item: { ...base, isNew: true, addedAt: "2026-10-05T11:47:11+08:00" },
    onClose() {},
  }));
  assert.match(html, /class="reference-new-badge">NEW<\/span>/);
  assert.match(html, /新增 2026-10-05 11:47:11 · 北京时间/);
});

test("an existing card without metadata retains its original markup", () => {
  const html = card();
  assert.doesNotMatch(html, /reference-added-meta|reference-new-badge|新增/);
});

test("a date alone does not label an existing card NEW", () => {
  for (const isNew of [undefined, false, "true"]) {
    const html = card({ isNew, addedAt: "2026-10-05T11:47:11+08:00" });
    assert.match(html, /新增 2026-10-05/);
    assert.doesNotMatch(html, /reference-new-badge/);
  }
});

test("addition dates use the Shanghai calendar day", () => {
  const html = card({ isNew: true, addedAt: "2026-10-04T17:00:00Z" });
  assert.match(html, /新增 2026-10-05/);
  assert.doesNotMatch(html, /新增 2026-10-04/);
});

test("invalid dates are omitted while an explicit NEW badge remains", () => {
  const html = card({ isNew: true, addedAt: "invalid-date" });
  assert.match(html, /reference-new-badge/);
  assert.doesNotMatch(html, /<time|Invalid Date|新增/);
});

test("empty and non-string dates do not create a metadata row", () => {
  for (const addedAt of ["", null, 0]) {
    assert.doesNotMatch(card({ addedAt }), /reference-added-meta|<time/);
  }
});
