import {continueRender,delayRender,staticFile} from 'remotion';
if(typeof document!=='undefined'){
 const handle=delayRender('Load local MiSans weights');
 Promise.all([[500,'Medium'],[600,'Semibold'],[700,'Bold'],[900,'Heavy']].map(async([weight,name])=>{
 const face=new FontFace('MiSans',`url("${staticFile('fonts/MiSans-'+name+'.otf')}")`,{weight:String(weight)});
 await face.load();document.fonts.add(face);
 })).then(()=>continueRender(handle));
}
