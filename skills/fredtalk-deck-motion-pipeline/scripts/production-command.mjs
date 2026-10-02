import {basename} from 'node:path';

// Names are a misuse guard, not proof of what arbitrary code will render.
// Inspect entrypoint/task names, never their directory names or media outputs.
export function productionCommandKind(args) {
  const tokens = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (['-e', '--eval', '-c', '--command'].includes(arg)) { index++; continue; }
    if (/\.(?:mp4|mov|mkv|webm|png|jpe?g|json)$/i.test(arg)) continue;
    if (arg.startsWith('-')) continue;
    const name = basename(arg).toLowerCase();
    if (/\.(?:m?js|cjs|jsx|tsx?|py|sh)$/i.test(name) || !arg.includes('/')) tokens.push(name);
  }
  const names = tokens.join(' ');
  const render = /(?:render|still|preview)/.test(names);
  const formal = /(?:^|[\s:_-])formal(?:[\s:_.-]|$)/.test(names);
  return {render, formal};
}
