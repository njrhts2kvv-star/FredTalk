import React from 'react';
import {Composition,staticFile} from 'remotion';
import Chat,{meta as chatMeta} from './talk/talk-chat-message-flow';
import Grid,{meta as gridMeta} from './talk/talk-grid-to-hero';
import Stack,{meta as stackMeta} from './talk/talk-stack-fan-out';
const pics=['product.png','article-title.png','article-method.png','article-workflow.png','article-review.png'].map(n=>staticFile(`fred/${n}`));
export const TalkRoot=()=> <>
<Composition id="V072" component={Chat} {...chatMeta} defaultProps={{hostSrc:staticFile('fred/host.webm')}}/>
<Composition id="V086" component={Grid} {...gridMeta} defaultProps={{srcs:pics.slice(0,4),labels:['Mic Pro','声音记录','使用方法','工作流程']}}/>
<Composition id="V098" component={Stack} {...stackMeta} defaultProps={{srcs:pics,title:'我的声音记录与工作笔记'}}/>
</>;
