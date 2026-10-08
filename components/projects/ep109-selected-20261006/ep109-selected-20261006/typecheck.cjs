#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {createRequire} = require('module');
const runtime = __dirname;
const requireRuntime = createRequire(path.join(runtime, 'package.json'));
const ts = requireRuntime('typescript');
const config = ts.readConfigFile(path.join(__dirname, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, __dirname);
parsed.options.baseUrl = __dirname;
parsed.options.paths = {
  react: [path.join(runtime, 'node_modules/@types/react/index.d.ts')],
  'react/jsx-runtime': [path.join(runtime, 'node_modules/@types/react/jsx-runtime.d.ts')],
  'react/jsx-dev-runtime': [path.join(runtime, 'node_modules/@types/react/jsx-dev-runtime.d.ts')],
  remotion: [path.join(runtime, 'node_modules/remotion', requireRuntime('remotion/package.json').types)],
};
parsed.options.typeRoots = [path.join(runtime, 'node_modules/@types')];
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
fs.mkdirSync(path.join(__dirname, 'verification'), {recursive: true});
fs.writeFileSync(path.join(__dirname, 'verification/typecheck.json'), JSON.stringify({status: diagnostics.length ? 'FAIL' : 'PASS', checkedFiles: parsed.fileNames.length, diagnostics: diagnostics.map(d => ({file: d.file ? path.relative(__dirname, d.file.fileName) : null, message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), code: d.code}))}, null, 2) + '\n');
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {getCanonicalFileName: f => f, getCurrentDirectory: () => __dirname, getNewLine: () => '\n'}));
  process.exitCode = 1;
} else console.log(JSON.stringify({status: 'PASS', checkedFiles: parsed.fileNames.length}));
