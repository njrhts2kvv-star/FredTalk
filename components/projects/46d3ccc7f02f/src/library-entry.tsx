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

const ReplaySP001: React.FC = () => <SP001/>;
const ReplaySP003: React.FC = () => <SP003/>;
const ReplaySP006: React.FC = () => <SP006/>;
const ReplaySP007: React.FC = () => <SP007/>;
const ReplaySP010: React.FC = () => <SP010/>;
const ReplaySP011: React.FC = () => <SP011/>;
const ReplaySP012: React.FC = () => <SP012/>;
const ReplaySP018: React.FC = () => <SP018/>;
const ReplaySP019: React.FC = () => <SP019/>;
const ReplaySP020: React.FC = () => <SP020/>;
const ReplaySP022: React.FC = () => <SP022/>;

const scenes: Record<string, React.FC> = {SP001: ReplaySP001,SP002,SP003: ReplaySP003,SP004,SP005,SP006: ReplaySP006,SP007: ReplaySP007,SP008,SP009,SP010: ReplaySP010,SP011: ReplaySP011,SP012: ReplaySP012,SP013,SP014,SP015,SP016,SP017,SP018: ReplaySP018,SP019: ReplaySP019,SP020: ReplaySP020,SP021,SP022: ReplaySP022,SP023,SP024};
const replayScenes = Object.fromEntries(Object.entries(scenes).map(([id, Scene]) => {
  const Visual = withFredFonts(Scene);
  const Replay: React.FC = () => <AbsoluteFill><Visual/></AbsoluteFill>;
  return [id, Replay];
}));
const Root: React.FC = () => <>{compositions.map(({id, ...timing}) =>
  <Composition key={id} id={id} component={replayScenes[id]} {...timing}
    defaultProps={{}}/>)}</>;
registerRoot(Root);
