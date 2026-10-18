// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {registerRoot} from 'remotion';
import {Root} from './Root';
import {TalkRoot} from './TalkRoot';
registerRoot(()=> <><Root/><TalkRoot/></>);
