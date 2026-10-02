#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const help=`Usage: node qc-video-deck.mjs --config <json> [--report <json>] [--parse-only]

Config fields:
  baseUrl, viewport, selectors{root,video,videoHost,darkBadge}, pages[]
Each page: slide, stableId, kind(opening|remotion|narrative-transition).
Set expectDarkBadgeOverlay=true only when the Deck adds a DOM overlay badge.
Optional playwrightModule points to playwright/index.mjs.`;
const args=process.argv.slice(2); const value=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
if(args.includes('--help')||args.includes('-h')){console.log(help);process.exit(0);}
const configFile=value('--config'); if(!configFile){console.error(help);process.exit(2);}
const configPath=resolve(configFile); const config=JSON.parse(await readFile(configPath,'utf8'));
const errors=[]; const pages=Array.isArray(config.pages)?config.pages:[];
if(!config.baseUrl) errors.push('baseUrl missing'); if(!pages.length) errors.push('pages missing');
const ids=new Set(); for(const [i,p] of pages.entries()){if(!p.stableId)errors.push(`pages[${i}].stableId missing`);if(ids.has(p.stableId))errors.push(`duplicate stableId ${p.stableId}`);ids.add(p.stableId);if(!(Number(p.slide)>0))errors.push(`invalid slide ${p.slide}`);}
if(args.includes('--parse-only')){const result={verdict:errors.length?'FAIL':'PASS',pageCount:pages.length,errors};console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;process.exit();}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const moduleName=config.playwrightModule??'playwright';
const playwright=moduleName.startsWith('/')?await import(pathToFileURL(moduleName).href):await import(moduleName);
const {chromium}=playwright; const selectors={root:'.deck-root',video:'video',videoHost:'[data-deck-video]',darkBadge:'[data-narrative-dark-brand="true"]',...(config.selectors??{})};
const snapshots={}; const consoleErrors=[]; const browser=await chromium.launch({headless:true});
const state=async(page)=>page.evaluate((s)=>{const v=document.querySelector(s.video);return{stableId:document.querySelector(s.root)?.getAttribute('data-stable-id'),paused:v?.paused,currentTime:v?.currentTime,duration:v?.duration,muted:v?.muted,volume:v?.volume,loop:v?.loop,readyState:v?.readyState,playback:document.querySelector(s.videoHost)?.getAttribute('data-video-playback'),darkBadgeCount:document.querySelectorAll(s.darkBadge).length};},selectors);
const waitMetadata=(page)=>page.waitForFunction((s)=>document.querySelector(s)?.readyState>=1,selectors.video,{timeout:8000});
try{
  const context=await browser.newContext({viewport:config.viewport??{width:1280,height:720}});const page=await context.newPage();
  page.on('console',(m)=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('pageerror',(e)=>consoleErrors.push(e.message));
  for(const [index,item] of pages.entries()){
    const url=new URL(config.baseUrl);url.searchParams.set(config.slideParam??'slide',String(item.slide));await page.goto(url.href,{waitUntil:'domcontentloaded'});
    await page.locator(selectors.video).waitFor({state:'attached',timeout:8000}).catch(()=>errors.push(`${item.stableId}: video missing`));
    if(await page.locator(selectors.video).count()!==1)continue;await waitMetadata(page).catch(()=>errors.push(`${item.stableId}: metadata timeout`));
    let before=await state(page);snapshots[`${item.stableId}:initial`]=before;
    if(before.stableId!==item.stableId)errors.push(`${item.stableId}: mounted ${before.stableId}`);if(before.loop)errors.push(`${item.stableId}: loop=true`);
    const expectedDark=item.expectDarkBadgeOverlay===true;if(expectedDark&&before.darkBadgeCount!==1)errors.push(`${item.stableId}: dark badge count ${before.darkBadgeCount}`);if(!expectedDark&&before.darkBadgeCount>0)errors.push(`${item.stableId}: unexpected dark badge`);
    if(index===0||item.kind==='opening'){
      if(!before.paused||before.currentTime>0.06)errors.push(`${item.stableId}: opening not held at frame zero`);if(before.muted||before.volume!==1)errors.push(`${item.stableId}: opening audio disabled`);
      await page.mouse.click((config.viewport?.width??1280)/2,(config.viewport?.height??720)/2);await page.waitForFunction((s)=>{const v=document.querySelector(s);return v&&!v.paused&&v.currentTime>.1;},selectors.video,{timeout:5000}).catch(()=>undefined);
      const after=await state(page);snapshots[`${item.stableId}:firstClick`]=after;if(after.stableId!==item.stableId)errors.push(`${item.stableId}: first click advanced`);if(after.paused||after.currentTime<.1)errors.push(`${item.stableId}: first click did not play`);
    }else{
      await page.waitForFunction((s)=>{const v=document.querySelector(s);return v&&!v.paused&&v.currentTime>.05;},selectors.video,{timeout:5000}).catch(()=>undefined);before=await state(page);
      if((before.paused||before.currentTime<.05)&&before.playback==='blocked'){
        await page.mouse.click((config.viewport?.width??1280)/2,(config.viewport?.height??720)/2);await page.waitForFunction((s)=>{const v=document.querySelector(s);return v&&!v.paused&&v.currentTime>.05;},selectors.video,{timeout:5000}).catch(()=>undefined);const unlocked=await state(page);if(unlocked.stableId!==item.stableId)errors.push(`${item.stableId}: audio unlock advanced slide`);before=unlocked;
      }
      snapshots[`${item.stableId}:playing`]=before;if(before.paused||before.currentTime<.05)errors.push(`${item.stableId}: did not autoplay`);if(before.muted||before.volume!==1)errors.push(`${item.stableId}: muted autoplay`);
    }
    await page.locator(selectors.video).evaluate(async(v)=>{v.currentTime=Math.max(0,v.duration-.08);await v.play();});await page.waitForFunction((s)=>document.querySelector(s)?.ended===true,selectors.video,{timeout:5000}).catch(()=>undefined);
    const ended=await state(page);snapshots[`${item.stableId}:ended`]=ended;if(!ended.paused||Math.abs(ended.duration-ended.currentTime)>.15)errors.push(`${item.stableId}: did not hold final frame`);
    if((index===0||item.kind==='opening')&&pages[index+1]){
      await page.mouse.click((config.viewport?.width??1280)/2,(config.viewport?.height??720)/2);await page.waitForFunction((input)=>document.querySelector(input.selector)?.getAttribute('data-stable-id')===input.expected,{selector:selectors.root,expected:pages[index+1].stableId},{timeout:5000}).catch(()=>undefined);const afterSecond=await state(page);snapshots[`${item.stableId}:secondClick`]=afterSecond;if(afterSecond.stableId!==pages[index+1].stableId)errors.push(`${item.stableId}: second click did not advance`);
    }
  }
  await context.close();
}finally{await browser.close();}
errors.push(...consoleErrors.map((x)=>`console: ${x}`));const result={verdict:errors.length?'FAIL':'PASS',pageCount:pages.length,config:configPath,generatedAt:new Date().toISOString(),snapshots,errors};
const report=value('--report');if(report)await writeFile(resolve(report),`${JSON.stringify(result,null,2)}\n`);console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
