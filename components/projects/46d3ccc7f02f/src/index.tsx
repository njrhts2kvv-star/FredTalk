import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Q03} from './q03';
import {SP004} from './sp004';
import {Q01} from './q01';
import {SP005} from './sp005';
import {Q11} from './q11';
import {SP023, SP024} from './sp023-024';
import {SP021} from './sp021';
import {Q17} from './q17';
import {SP009, SP017, SP020} from './quick-drafts';
import {Q05} from './q05';
import {SP008} from './sp008';
import {Q12} from './q12';
import {SP015, SP016} from './sp015-016';
import {SP019} from './sp019';
import {Q15} from './q15';
import {Q14} from './q14';
import {Q16} from './q16';
import {SP002, SP003} from './sp002-003';
import {SP001,SP006,SP007,SP010,SP011,SP012,SP013,SP014,SP018,SP022,Q02,Q07,Q13} from './remaining';
import manifest from '../manifest.json';
import {withFredFonts} from './fred-scene';

const page = manifest.pages[0];

const FredQ03 = withFredFonts(Q03);
const FredSP004 = withFredFonts(SP004);
const FredQ01 = withFredFonts(Q01);
const FredSP005 = withFredFonts(SP005);
const FredQ11 = withFredFonts(Q11);
const FredSP023 = withFredFonts(SP023);
const FredSP024 = withFredFonts(SP024);
const FredSP021 = withFredFonts(SP021);
const FredQ17 = withFredFonts(Q17);
const FredSP009 = withFredFonts(SP009);
const FredSP017 = withFredFonts(SP017);
const FredSP020 = withFredFonts(SP020);
const FredQ05 = withFredFonts(Q05);
const FredSP008 = withFredFonts(SP008);
const FredQ12 = withFredFonts(Q12);
const FredSP015 = withFredFonts(SP015);
const FredSP016 = withFredFonts(SP016);
const FredSP019 = withFredFonts(SP019);
const FredQ15 = withFredFonts(Q15);
const FredQ14 = withFredFonts(Q14);
const FredQ16 = withFredFonts(Q16);
const FredSP002 = withFredFonts(SP002);
const FredSP003 = withFredFonts(SP003);
const FredSP001 = withFredFonts(SP001);
const FredSP006 = withFredFonts(SP006);
const FredSP007 = withFredFonts(SP007);
const FredSP010 = withFredFonts(SP010);
const FredSP011 = withFredFonts(SP011);
const FredSP012 = withFredFonts(SP012);
const FredSP013 = withFredFonts(SP013);
const FredSP014 = withFredFonts(SP014);
const FredSP018 = withFredFonts(SP018);
const FredSP022 = withFredFonts(SP022);
const FredQ02 = withFredFonts(Q02);
const FredQ07 = withFredFonts(Q07);
const FredQ13 = withFredFonts(Q13);

const Root: React.FC = () => (<>
  <Composition id={page.stableId} component={FredQ03} width={page.width} height={page.height}
               fps={page.fps} durationInFrames={page.durationInFrames} />
  <Composition id="SP004" component={FredSP004} width={1920} height={1080}
               fps={30} durationInFrames={154} />
  <Composition id="Q01" component={FredQ01} width={1920} height={1080}
               fps={30} durationInFrames={270} />
  <Composition id="SP005" component={FredSP005} width={1920} height={1080}
               fps={30} durationInFrames={117} />
  <Composition id="Q11" component={FredQ11} width={1920} height={1080}
               fps={30} durationInFrames={240} />
  <Composition id="SP023" component={FredSP023} width={2560} height={1440}
               fps={60} durationInFrames={195} />
  <Composition id="SP024" component={FredSP024} width={2560} height={1440}
               fps={60} durationInFrames={260} />
  <Composition id="SP021" component={FredSP021} width={1920} height={1080}
               fps={30} durationInFrames={55} />
  <Composition id="Q17" component={FredQ17} width={1920} height={1080}
               fps={30} durationInFrames={330} />
  <Composition id="SP009" component={FredSP009} width={1920} height={1080}
               fps={30} durationInFrames={195} />
  <Composition id="SP017" component={FredSP017} width={1920} height={1080}
               fps={30} durationInFrames={138} />
  <Composition id="SP020" component={FredSP020} width={1920} height={1080}
               fps={30} durationInFrames={305} />
  <Composition id="Q05" component={FredQ05} width={1920} height={1080}
               fps={30} durationInFrames={660} />
  <Composition id="SP008" component={FredSP008} width={1920} height={1080}
               fps={30} durationInFrames={184} />
  <Composition id="Q12" component={FredQ12} width={1920} height={1080}
               fps={30} durationInFrames={1050} />
  <Composition id="SP015" component={FredSP015} width={1920} height={1080}
               fps={30} durationInFrames={244} />
  <Composition id="SP016" component={FredSP016} width={1920} height={1080}
               fps={30} durationInFrames={389} />
  <Composition id="SP019" component={FredSP019} width={1920} height={1080}
               fps={30} durationInFrames={398} />
  <Composition id="Q15" component={FredQ15} width={1920} height={1080}
               fps={30} durationInFrames={330} />
  <Composition id="Q14" component={FredQ14} width={1920} height={1080}
               fps={30} durationInFrames={1710} />
  <Composition id="Q16" component={FredQ16} width={1920} height={1080}
               fps={30} durationInFrames={480} />
  <Composition id="SP002" component={FredSP002} width={1920} height={1080}
               fps={60} durationInFrames={300} />
  <Composition id="SP003" component={FredSP003} width={1920} height={1080}
               fps={60} durationInFrames={568} />

  <Composition id="SP001" component={FredSP001} width={1920} height={1080} fps={60} durationInFrames={1031} />
  <Composition id="SP006" component={FredSP006} width={1920} height={1080} fps={30} durationInFrames={324} />
  <Composition id="SP007" component={FredSP007} width={1920} height={1080} fps={30} durationInFrames={477} />
  <Composition id="SP010" component={FredSP010} width={1920} height={1080} fps={60} durationInFrames={300} />
  <Composition id="SP011" component={FredSP011} width={1920} height={1080} fps={30} durationInFrames={149} />
  <Composition id="SP012" component={FredSP012} width={1920} height={1080} fps={30} durationInFrames={450} />
  <Composition id="SP013" component={FredSP013} width={1920} height={1080} fps={30} durationInFrames={368} />
  <Composition id="SP014" component={FredSP014} width={1920} height={1080} fps={30} durationInFrames={274} />
  <Composition id="SP018" component={FredSP018} width={1920} height={1080} fps={30} durationInFrames={127} />
  <Composition id="SP022" component={FredSP022} width={1920} height={1080} fps={30} durationInFrames={128} />
  <Composition id="Q02" component={FredQ02} width={1920} height={1080} fps={30} durationInFrames={570} />
  <Composition id="Q07" component={FredQ07} width={1920} height={1080} fps={30} durationInFrames={1380} />
  <Composition id="Q13" component={FredQ13} width={1920} height={1080} fps={30} durationInFrames={330} />
</>);

registerRoot(Root);
