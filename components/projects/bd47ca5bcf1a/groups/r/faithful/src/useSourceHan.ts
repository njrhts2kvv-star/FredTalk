import {FiveFontFace} from "../../../../five-fonts.ts";
import {useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
export const useSourceHan=()=>{const [handle]=useState(()=>delayRender('Load SourceHan selected font'));useEffect(()=>{const face=new FiveFontFace('RSourceHan',`url(${staticFile('fonts/MiSans-Heavy.otf')})`,{weight:'900'});face.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle)}).catch(cancelRender)},[handle]);};
