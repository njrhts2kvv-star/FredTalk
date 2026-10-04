const assert=require('node:assert/strict');
const {activeFrame,adjacentFrame}=require('../skills/fred-remotion-output/templates/review-timeline.js');
const f=(id,scene,start,end,time)=>({rowId:id,stableId:scene,context:{startSeconds:start,endSeconds:end},artifact:{timeSeconds:time}});
const frames=[f('a','s1',0,2,.5),f('b','s1',0,2,1.5),f('c','s2',3,5,3.2)];
assert.equal(activeFrame(frames,0).rowId,'a');
assert.equal(activeFrame(frames,1.8).rowId,'b');
assert.equal(activeFrame(frames,2.5),null);
assert.equal(activeFrame(frames,3).rowId,'c');
assert.equal(activeFrame(frames,5),null);
assert.equal(activeFrame(frames,NaN),null);
assert.equal(activeFrame(frames,.6).rowId,'a'); // rewind
assert.equal(adjacentFrame(frames,'b',1).rowId,'c');
assert.equal(adjacentFrame(frames,'a',-1).rowId,'a');
assert.equal(adjacentFrame([],null,1),null);
console.log('Discrete frame clock: 10 assertions passed');
