import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {withFredFonts} from './fred-scene';
import compositions from '../compositions.json';
import {SP004} from './sp004';
import {SP005} from './sp005';
import {SP023, SP024} from './sp023-024';
import {SP021} from './sp021';
import {SP009, SP017, SP020} from './quick-drafts';
import {SP008} from './sp008';
import {SP015, SP016} from './sp015-016';
import {SP019} from './sp019';
import {SP002, SP003} from './sp002-003';
import {SP001, SP006, SP007, SP010, SP011, SP012, SP013, SP014, SP018, SP022} from './remaining';

const ReplaySP008: React.FC = () => <SP008/>;
const ReplaySP009: React.FC = () => <SP009/>;
const ReplaySP014: React.FC = () => <SP014/>;
const ReplaySP016: React.FC = () => <SP016/>;

const scenes: Record<string, React.FC> = {SP001,SP002,SP003,SP004,SP005,SP006,SP007,SP008: ReplaySP008,SP009: ReplaySP009,SP010,SP011,SP012,SP013,SP014: ReplaySP014,SP015,SP016: ReplaySP016,SP017,SP018,SP019,SP020,SP021,SP022,SP023,SP024};
const replayScenes = Object.fromEntries(Object.entries(scenes).map(([id, Scene]) => {
  const Visual = withFredFonts(Scene);
  const Replay: React.FC = () => <AbsoluteFill><Visual/></AbsoluteFill>;
  return [id, Replay];
}));
const Root: React.FC = () => <>{compositions.map(({id, ...timing}) =>
  <Composition key={id} id={id} component={replayScenes[id]} {...timing}
    defaultProps={{}}/>)}</>;
registerRoot(Root);
