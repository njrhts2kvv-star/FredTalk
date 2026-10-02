// Resolve only supported options. Actual backend success still requires a
// matching-frame/complex-scene check in the current production environment.
export function resolveRenderOptions(config) {
 const browsers=config.browsers??4,concurrency=config.concurrency??2;
 for(const [key,value] of Object.entries({browsers,concurrency}))if(!Number.isInteger(value)||value<=0)throw new Error(`${key} must be a positive integer`);
 if(Object.hasOwn(config,'software'))throw new Error('Use the explicit supported gl field; software is not a public render option');
 if(browsers!==4||concurrency!==2)throw new Error('EP99 requires four independent browsers with two pages each');
 const gl=config.gl??undefined;
 if(gl!==undefined&&!['angle','egl','swiftshader','swangle','angle-egl','vulkan'].includes(gl))throw new Error('Unsupported gl backend');
 const browserExecutable=config.browserExecutable??undefined;
 if(browserExecutable!==undefined&&(typeof browserExecutable!=='string'||!browserExecutable.trim()))throw new Error('browserExecutable must name a verified browser or launcher');
 const chromeMode=config.chromeMode??'chrome-for-testing';
 if(!['chrome-for-testing','headless-shell'].includes(chromeMode))throw new Error('Unsupported chromeMode');
 const review=config.configurationReview;
 if(review!==undefined&&(typeof review!=='object'||review===null||Array.isArray(review)||!['verified','unverified'].includes(review.status)||typeof review.reason!=='string'||!review.reason.trim()||(review.status==='verified'&&(typeof review.evidence!=='string'||!review.evidence.trim()))))throw new Error('configurationReview, when provided, needs status/reason and evidence for a verified claim');
 return {browsers,concurrency,gl,browserExecutable,chromeMode};
}
