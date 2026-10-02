import {SeedancePage} from './SeedancePage';
import React from 'react';
import {Photo} from './common';
import data from '../../../../specs/R007.json';
import {measured,ClipSpec} from '../../../../runtime/clip-spec';
export const MontageV3=({t}:{t:number})=>{const [x,y,w,h]=measured(data as unknown as ClipSpec,'window',(t-281.333338)*60),o=data.objects.mediaWindow;return <><SeedancePage blur={20} brightness={1}/><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:o.radius,overflow:'hidden'}}><Photo name={o.media} style={{objectFit:'cover'}}/></div></>};
