import test from 'node:test';
import assert from 'node:assert/strict';
import {phase,branchState,expandReturn,slotState,handoffState,audioPosition,frostedFocusState} from '../assets/content-motion/motion-state.mjs';
test('phases settle exactly, without movement throughout the reading hold',()=>{
 assert.equal(phase(-1,0,1),0);for(const t of [1,2,20])assert.equal(phase(t,0,1),1);
 assert.throws(()=>phase(0,1,1));
});
test('branch focus ends with one stable selected object at the original stage',()=>{
 const config={origin:[400,200,200,100],targets:[[0,0,200,100],[400,0,200,100],[800,0,200,100]],selected:1,expand:[0,1],focus:[2,3]};
 const s=branchState({...config,time:4});assert.equal(s.filter(x=>x.visible).length,1);assert.deepEqual(s[1].box,config.origin);
});
test('branch opening exposes one readable object before the split',()=>{
 const config={origin:[400,200,200,100],targets:[[0,0,200,100],[400,0,200,100],[800,0,200,100]],selected:1,expand:[1,2],focus:[3,4]};
 for(const time of [0,1]){
  const s=branchState({...config,time});assert.equal(s.filter(x=>x.visible).length,1,'Unexpanded labels must not stack at the origin');
 }
});
test('expanded content returns to its own exact original geometry',()=>{
 const c={rest:[200,100,300,200],expanded:[40,40,1000,600],open:[0,1],close:[4,5]};
 assert.deepEqual(expandReturn({...c,time:2}),c.expanded);assert.deepEqual(expandReturn({...c,time:5}),c.rest);
});
test('slot boundary exposes one complete value rather than both or a blank frame',()=>{
 const items=[{at:0,value:'first'},{at:1,value:'second'}];assert.equal(slotState(1-1/60,items).value,'first');assert.equal(slotState(1,items).value,'second');
});
test('handoff surface never disappears and geometry does not overshoot',()=>{
 const c={from:[0,0,300,200],to:[700,300,600,400],travel:[1,2],swap:[1.3,1.7]};
 for(let f=0;f<=180;f++) {const s=handoffState({...c,time:f/60});assert.equal(s.surfaceVisible,true);assert.ok(Math.abs(s.oldContent+s.newContent-1)<1e-10);assert.ok(s.box[0]>=0&&s.box[0]<=700);}
 assert.deepEqual(handoffState({...c,time:3}).box,c.to);
});
test('waveform time marks share one scale and playback stays within its duration',()=>{
 assert.equal(audioPosition(6,24,600),150);assert.equal(audioPosition(12,24,600),300);assert.equal(audioPosition(36,24,600),600);
});
test('frosted focus has a clear start and bounded blur/tint for either surface tone',()=>{
 const clear=frostedFocusState({progress:0});
 assert.equal(clear.blurPx,0);assert.equal(clear.tintAlpha,0);assert.equal(clear.foregroundVisible,false);
 for(const tone of ['light','dark']){
  const settled=frostedFocusState({progress:1,tone,blur:20,tintOpacity:.6});
  assert.equal(settled.blurPx,20);assert.equal(settled.tintAlpha,.6);assert.equal(settled.foregroundVisible,true);
  assert.deepEqual(settled.tintRgb,tone==='light'?[255,255,255]:[0,0,0]);
  assert.deepEqual(frostedFocusState({progress:5,tone,blur:20,tintOpacity:.6}),settled);
  assert.deepEqual(frostedFocusState({progress:-1,tone}),frostedFocusState({progress:0,tone}));
 }
});
test('frosted focus stays stable during foreground changes and reverse seeking',()=>{
 const config={tone:'dark',blur:18,tintOpacity:.5};
 const settled=frostedFocusState({...config,progress:1});
 for(let f=0;f<240;f++)assert.deepEqual(frostedFocusState({...config,progress:1}),settled);
 const forwards=Array.from({length:61},(_,f)=>frostedFocusState({...config,progress:f/60}));
 for(let f=60;f>=0;f--)assert.deepEqual(frostedFocusState({...config,progress:f/60}),forwards[f]);
 for(let f=1;f<forwards.length;f++){
  assert.ok(forwards[f].blurPx>=forwards[f-1].blurPx);assert.ok(forwards[f].tintAlpha>=forwards[f-1].tintAlpha);
 }
});
test('frosted focus rejects invalid configuration rather than generating invalid CSS',()=>{
 for(const progress of [NaN,Infinity,-Infinity])assert.throws(()=>frostedFocusState({progress}));
 for(const blur of [-1,NaN,Infinity])assert.throws(()=>frostedFocusState({progress:.5,blur}));
 for(const tintOpacity of [-.1,1.1,NaN])assert.throws(()=>frostedFocusState({progress:.5,tintOpacity}));
 assert.throws(()=>frostedFocusState({progress:.5,tone:'gray'}));
});
