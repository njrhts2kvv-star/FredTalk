import React from 'react';
import {Composition,staticFile} from 'remotion';
import Chat,{meta as chatMeta} from './talk/talk-chat-message-flow';
import Grid,{meta as gridMeta} from './talk/talk-grid-to-hero';
import Stack,{meta as stackMeta} from './talk/talk-stack-fan-out';
const pics=['fred-team-meeting.jpg', 'fred-family.jpg', 'fred-conversation.jpg', 'fred-mic-magnet.jpg', 'fred-mic-clip.jpg'].map(n=>staticFile(`fred/${n}`));
export const TalkRoot=()=> <>
<Composition id="V072" component={Chat} {...chatMeta} defaultProps={{hostSrc:staticFile('fred/host.webm')}}/>
<Composition id="V086" component={Grid} {...gridMeta} defaultProps={{srcs:pics.slice(0,4),labels:['会议讨论','亲子共读','日常交流','随身佩戴']}}/>
<Composition id="V098" component={Stack} {...stackMeta} defaultProps={{srcs:[...pics.slice(0,3),staticFile('fred/fred-computer-work.jpg'),staticFile('fred/fred-night-review.jpg')],title:'值得记住的日常'}}/>
</>;
