const path = require('path'), fs = require('fs'), ts = require('typescript');
const files = fs.readdirSync(path.join(__dirname, 'src')).filter(x => /\.tsx?$/.test(x)).map(x => path.join(__dirname, 'src', x));
const options = {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.NodeJs, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true, allowSyntheticDefaultImports: true, skipLibCheck: true, noEmit: true};
const program = ts.createProgram(files, options), diagnostics = ts.getPreEmitDiagnostics(program);
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, {getCurrentDirectory: () => __dirname, getCanonicalFileName: x => x, getNewLine: () => '\n'}));
if (diagnostics.length) process.exit(1);
console.log('TypeScript passed: ' + files.length + ' files');
