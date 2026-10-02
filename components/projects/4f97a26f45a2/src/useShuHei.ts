import {useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
export const useShuHei=()=>{const [handle]=useState(()=>delayRender('Load official Alimama ShuHei'));useEffect(()=>{const face=new FontFace('OfficialShuHei',`url(${staticFile('fonts/AlimamaShuHei.ttf')})`,{weight:'700'});face.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle)}).catch(cancelRender)},[handle]);};
