#!/usr/bin/env node
import {verifyLibrary} from './motion-library.mjs';
const i=process.argv.indexOf('--library');
const result=verifyLibrary(i>=0?process.argv[i+1]:undefined);
console.log(JSON.stringify(result,null,2));if(result.verdict!=='PASS')process.exitCode=1;
