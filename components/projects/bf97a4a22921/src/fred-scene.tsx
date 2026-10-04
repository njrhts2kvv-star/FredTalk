import {approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import manifest from '../manifest.json';
import {AbsoluteFill, cancelRender, continueRender, delayRender} from 'remotion';

const fontRules = `
@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Regular.otf')}') format('opentype');font-weight:400;font-display:block}
@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}') format('opentype');font-weight:500;font-display:block}
@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}') format('opentype');font-weight:600 700;font-display:block}
@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Heavy.otf')}') format('opentype');font-weight:800 900;font-display:block}
@font-face{font-family:SmileySans;src:url('${staticFile('fonts/SmileySans-Oblique.ttf')}') format('truetype');font-weight:400 900;font-display:block}
@font-face{font-family:FusionPixel;src:url('${staticFile('fonts/fusion-pixel-12px-proportional-zh_hans.ttf')}') format('truetype');font-weight:400 900;font-display:block}
@font-face{font-family:Heavy;src:url('${staticFile('fonts/MiSans-Heavy.otf')}') format('opentype');font-weight:400 900;font-display:block}
@font-face{font-family:MiSansWindow;src:url('${staticFile('fonts/MiSans-Heavy.otf')}') format('opentype');font-weight:400 900;font-display:block}
@font-face{font-family:Pixel;src:url('${staticFile('fonts/fusion-pixel-12px-proportional-zh_hans.ttf')}') format('truetype');font-weight:400 900;font-display:block}
@font-face{font-family:Smiley;src:url('${staticFile('fonts/SmileySans-Oblique.ttf')}') format('truetype');font-weight:400 900;font-display:block}

`;

/** Load the actual project fonts before any composition is captured. */
export function withFredFonts(Scene: React.FC): React.FC {
  const FredScene: React.FC = () => {
    const [handle] = useState(() => delayRender('load frozen Fred fonts'));
    useEffect(() => {
      let active = true;
      Promise.all([
        document.fonts.load('400 48px MiSans'),
        document.fonts.load('500 48px MiSans'),
        document.fonts.load('600 48px MiSans'),
        document.fonts.load('700 48px MiSans'),
        document.fonts.load('900 48px MiSans'),
        document.fonts.load('400 48px SmileySans'),
        document.fonts.load('400 48px FusionPixel'),
        document.fonts.load('900 48px Heavy'),
        document.fonts.load('900 48px MiSansWindow'),
        document.fonts.load('400 48px Pixel'),
        document.fonts.load('400 48px Smiley'),
      ]).then((faces) => { if (faces.some((loaded) => loaded.length === 0)) throw new Error('Frozen project font failed to load'); if (active) continueRender(handle); }).catch((error) => cancelRender(error));
      return () => { active = false; };
    }, [handle]);
    return <AbsoluteFill style={{fontFamily: manifest.designContract.typography.primary, fontSynthesis: 'none'}}>
      <style>{fontRules}</style>
      <Scene/>
    </AbsoluteFill>;
  };
  return FredScene;
}
