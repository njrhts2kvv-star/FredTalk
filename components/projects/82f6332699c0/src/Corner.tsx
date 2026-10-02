import React from 'react';
import {Img,staticFile} from 'remotion';
// Approved spec: logical 1080 coordinates; renderer scales once to 4K.
export function Corner({dark=false}:{dark?:boolean}){
 if(dark)return <div style={{position:'absolute',left:1554.5,top:41,width:335,height:75,overflow:'hidden',zIndex:1000}}><Img src={staticFile('brand-dark-source.png')} style={{position:'absolute',width:2172*335/1528,height:724*75/341,left:-295*335/1528,top:-184*75/341}}/></div>;
 return <Img src={staticFile('brand-light.png')} style={{position:'absolute',left:1549.5,top:36,width:345.5,height:85,zIndex:1000}}/>;
}
