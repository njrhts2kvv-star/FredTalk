#!/usr/bin/env node
const help = 'This legacy entry is retired. Query the current ledger with list-approved-styles.mjs (--query / --topology / --id), or import an explicit selection into a NEW directory with sync-approved-style-library.mjs --source --plan --library. Historical selection counts are not current approvals.';
console.error(help);
process.exit(process.argv.includes('--help') ? 0 : 2);
