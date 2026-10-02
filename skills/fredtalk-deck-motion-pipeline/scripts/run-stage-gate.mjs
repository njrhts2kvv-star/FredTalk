#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {productionCommandKind} from './production-command.mjs';

const args = process.argv.slice(2);
const separator = args.indexOf('--');
if (separator < 0 || separator === args.length - 1) {
  console.error('Usage: node run-stage-gate.mjs <gate options> -- <command> [args...]');
  process.exit(2);
}

const gateArgs = args.slice(0, separator);
const commandArgs = args.slice(separator + 1);
const option = (name) => {
  const index = gateArgs.indexOf(name);
  return index >= 0 ? gateArgs[index + 1] : undefined;
};
const stage = option('--stage');
const action = option('--action');
const expectedAction = {
  direction: 'direction-check',
  motion: 'motion-build',
  render: 'preview-render',
  formal: 'formal-render',
}[stage];
if (!expectedAction || action !== expectedAction) {
  console.error(`BLOCKED: stage ${stage ?? '(missing)'} requires --action ${expectedAction ?? '(invalid stage)'}`);
  process.exit(2);
}
if (!option('--prompt') || !option('--receipt-out')) {
  console.error('BLOCKED: every action requires --prompt and --receipt-out');
  process.exit(2);
}
if (stage !== 'direction' && !option('--previous-receipt')) {
  console.error(`BLOCKED: ${stage} requires --previous-receipt`);
  process.exit(2);
}
if (['render', 'formal'].includes(stage) && !option('--source-dir')) {
  console.error(`BLOCKED: ${stage} requires --source-dir bound by the contract`);
  process.exit(2);
}
if (stage === 'formal' && !option('--approval')) {
  console.error('BLOCKED: formal-render requires --approval');
  process.exit(2);
}
const {formal: looksFormal, render: looksRender} = productionCommandKind(commandArgs);
if (looksFormal && stage !== 'formal') {
  console.error('BLOCKED: an explicitly formal task needs the formal stage');
  process.exit(2);
}
if (['direction', 'motion'].includes(stage) && looksRender) {
  console.error('BLOCKED: direction/motion actions cannot launch a known render command');
  process.exit(2);
}
// stage/action and current receipts/authorization identify production intent.
// Resolution and path/task spelling do not establish sample acceptance.
// Unknown orchestration scripts must be inspected by the caller for their role.
const validatorArgs = gateArgs.filter((item, index) => item !== '--action' && gateArgs[index - 1] !== '--action');
const validator = resolve(import.meta.dirname, 'validate-stage-gate.mjs');
const gate = spawnSync(process.execPath, [validator, ...validatorArgs], {stdio: 'inherit'});
if (gate.error) {
  console.error(`Gate failed to start: ${gate.error.message}`);
  process.exit(2);
}
if (gate.status !== 0) {
  console.error('BLOCKED: production command was not executed');
  process.exit(gate.status ?? 1);
}

const command = spawnSync(commandArgs[0], commandArgs.slice(1), {stdio: 'inherit'});
if (command.error) {
  console.error(`Command failed to start: ${command.error.message}`);
  process.exit(2);
}
process.exit(command.status ?? 1);
