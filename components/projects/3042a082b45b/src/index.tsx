import React from 'react';
import {registerRoot} from 'remotion';
import {Root} from './Root';
import {TalkRoot} from './TalkRoot';
registerRoot(()=> <><Root/><TalkRoot/></>);
